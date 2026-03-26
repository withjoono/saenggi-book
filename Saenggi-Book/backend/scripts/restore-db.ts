import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Configuration
const CONTAINER_NAME = 'hub-postgres';
const DB_USER = 'tsuser';
const DB_NAME = 'geobukschool_dev';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`❌ Backup directory not found: ${BACKUP_DIR}`);
    process.exit(1);
}

// Find latest backup file
const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.sql'))
    .map(file => ({
        name: file,
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

if (files.length === 0) {
    console.error('❌ No backup files found.');
    process.exit(1);
}

const latestBackup = files[0].name;
const backupPath = path.join(BACKUP_DIR, latestBackup);

console.log(`👇 found latest backup: ${latestBackup}`);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(`⚠️  WARNING: This will overwite the current database '${DB_NAME}'.\n❓ Are you sure you want to restore from '${latestBackup}'? (y/N): `, (answer) => {
    if (answer.toLowerCase() !== 'y') {
        console.log('❌ Restore cancelled.');
        rl.close();
        process.exit(0);
    }

    console.log(`🔄 Restoring from ${latestBackup}...`);

    // Restore command
    // Use shell piping. Note: 'docker exec -i' is crucial for accepting input from stdin.
    // On Windows, 'type' is used to cat files.
    const command = `type "${backupPath}" | docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} ${DB_NAME}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Restore failed: ${error.message}`);
            rl.close();
            return;
        }
        console.log('✅ Restore completed successfully!');
        rl.close();
    });
});
