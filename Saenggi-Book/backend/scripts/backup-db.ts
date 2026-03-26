import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONTAINER_NAME = 'hub-postgres';
const DB_USER = 'tsuser';
const DB_NAME = 'geobukschool_dev';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

// Generate filename: backup_YYYY-MM-DD_HH-mm-ss.sql
const now = new Date();
const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
const filename = `backup_${timestamp}.sql`;
const filePath = path.join(BACKUP_DIR, filename);

console.log(`📦 Starting backup of database '${DB_NAME}' from container '${CONTAINER_NAME}'...`);

// Command to execute
// On Windows, using 'type' or 'cat' might differ, but for backup we use redirection > which works in exec.
const command = `docker exec ${CONTAINER_NAME} pg_dump -U ${DB_USER} ${DB_NAME} > "${filePath}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        return;
    }
    if (stderr) {
        // pg_dump might output warnings to stderr, which is not necessarily a failure, but good to know.
        // However, exec treats any stderr output as just output, not error parameter unless exit code is non-zero.
        // console.log(`Stderr: ${stderr}`); 
    }

    // Verify file creation and size
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ Backup successful!`);
        console.log(`   File: ${filename}`);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Path: ${filePath}`);
    } else {
        console.error('❌ Backup file was not created.');
    }
});
