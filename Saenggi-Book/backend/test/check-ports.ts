
import * as net from 'net';

const ports = [3000, 3011, 4007, 4011, 8080];

async function checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => {
            resolve(false);
        });
        socket.connect(port, '127.0.0.1');
    });
}

async function scan() {
    console.log('Scanning ports...');
    for (const port of ports) {
        const isOpen = await checkPort(port);
        console.log(`Port ${port}: ${isOpen ? 'OPEN' : 'CLOSED'}`);
    }
}

scan();
