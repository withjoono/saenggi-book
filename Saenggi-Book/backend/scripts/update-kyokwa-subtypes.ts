import { DataSource } from 'typeorm';

async function updateKyokwaSubtypes() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'tsuser',
        password: 'tsuser1234',
        database: 'geobukschool_dev',
        entities: [],
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log('✅ Connected to DB');

        // 1. Fetch all subtypes
        const subtypes = await dataSource.query(`SELECT id, name, category_id FROM ss_admission_subtype`);
        console.log(`Loaded ${subtypes.length} subtypes.`);

        // 2. Fetch all 'Special' recruitment units
        // Also fetch 'region_major' for regional matchmaking
        const units = await dataSource.query(`
      SELECT id, admission_name, region_major 
      FROM susi_kyokwa_recruitment 
      WHERE admission_category = '특별'
    `);
        console.log(`Loaded ${units.length} special recruitment units.`);

        let updateCount = 0;

        // 3. Match logic
        for (const unit of units) {
            const matchedIds: number[] = [];
            const name = unit.admission_name.replace(/\s+/g, ''); // Remove spaces for better matching

            for (const subtype of subtypes) {
                // Special case for Regional Talent (지역인재)
                if (subtype.name.startsWith('지역인재-')) {
                    if (name.includes('지역인재')) {
                        const region = subtype.name.split('-')[1]; // 강원, 대경, etc.
                        // Check if unit's region matches the subtype's region suffix
                        // Note: unit.region_major might be '강원', '대구/경북' etc.
                        // We need to be careful.

                        // Simple heuristic: If the university region matches the subtype region name
                        // Or if the admission name explicitly says "지역인재(강원)"

                        // Mapping region_major to subtype suffix
                        let regionMatch = false;
                        if (region === '강원' && unit.region_major === '강원') regionMatch = true;
                        if (region === '제주' && unit.region_major === '제주') regionMatch = true;
                        if (region === '호남' && (unit.region_major === '광주' || unit.region_major === '전남' || unit.region_major === '전북')) regionMatch = true;
                        if (region === '충청' && (unit.region_major === '대전' || unit.region_major === '세종' || unit.region_major === '충남' || unit.region_major === '충북')) regionMatch = true;
                        if (region === '대경' && (unit.region_major === '대구' || unit.region_major === '경북')) regionMatch = true;
                        if (region === '부울경' && (unit.region_major === '부산' || unit.region_major === '울산' || unit.region_major === '경남')) regionMatch = true;

                        if (regionMatch) {
                            matchedIds.push(subtype.id);
                        }
                    }
                }
                // Generics (농어촌, 특성화고 etc.)
                else {
                    if (name.includes(subtype.name.replace(/\s+/g, ''))) {
                        matchedIds.push(subtype.id);
                    }
                    // Alias checks
                    else if (subtype.name === '농어촌' && name.includes('농어촌')) matchedIds.push(subtype.id);
                    else if (subtype.name === '기초생활수급자' && (name.includes('기초') || name.includes('수급자') || name.includes('기회균형'))) matchedIds.push(subtype.id);
                    else if (subtype.name === '특성화고교' && name.includes('특성화')) matchedIds.push(subtype.id);
                }
            }

            if (matchedIds.length > 0) {
                const uniqueIds = [...new Set(matchedIds)].join(',');
                await dataSource.query(`
          UPDATE susi_kyokwa_recruitment 
          SET admission_subtype = $1 
          WHERE id = $2
        `, [uniqueIds, unit.id]);
                updateCount++;

                if (updateCount % 100 === 0) {
                    console.log(`Updated ${updateCount} records...`);
                }
            }
        }

        console.log(`✅ Finished! Updated ${updateCount} / ${units.length} records.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await dataSource.destroy();
    }
}

updateKyokwaSubtypes();
