const axios = require('axios');

async function test() {
    try {
        const payload = {
            category: "academic",
            materials: [
                {
                    id: "m0",
                    title: "과학 탐구",
                    summary: "물리학 호기심 탐구",
                    gradeLevel: "1",
                    sources: [{ grade: "1학년" }]
                },
                {
                    id: "m1",
                    title: "물리 실험",
                    summary: "양자역학 실험 진행",
                    gradeLevel: "2",
                    sources: [{ grade: "2학년" }]
                }
            ]
        };

        const res = await axios.post('https://saenggiview-backend-dot-ts-back-nest-479305.du.r.appspot.com/schoolrecord/timeline', payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log("RESPONSE DATA:");
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log("ERROR:");
        console.log(e.response ? e.response.data : e.message);
    }
}

test();
