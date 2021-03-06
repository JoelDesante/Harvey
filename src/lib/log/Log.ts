import fileStream from 'fs';

export class Logger {

    private logStamp: Date;
    private logFilePath: string;

    constructor() {
        
        this.logStamp = new Date();
        if(process.env.LOG_OUTPUT_PATH === undefined) {
            throw new Error(`No path has been defined. Please check the config in /config/.env.`);
        }

        // To reduce the number of files created while in development. Debug mode will dump all debug logs to one output.
        this.logFilePath = `${process.env.LOG_OUTPUT_PATH}/log.${this.logStamp.toUTCString()}.txt`;
        if(process.env.DEBUG) {
            this.logFilePath = `${process.env.LOG_OUTPUT_PATH}/log.DEBUG.txt`;
        }

        try {
            const createDirectory = fileStream.mkdirSync(process.env.LOG_OUTPUT_PATH, { recursive: true });
        } catch(err) {
            switch(err.code) {
                case 'EACCES':
                    console.warn('Unable to logging create directory. Permission Denied!');
                    return;
                default:
                    console.log('Unable to create logging directory.', err);
                    return;
            }
        }

        if(process.env.DEBUG) {
            this.info('Start of debug log.');
        } else {
            this.info('Start of log.')
        }
    }

    public info(message: string): void {
        try {
            this.toFile('INFO', message);
        } catch(err) {
            console.warn('Could not write to log file.', err);
        }
        console.info(this.consoleLine('INFO', message));
    }
    public debug(message: string, error: Error | string = ''): void {
        if(process.env.DEBUG) {

            let out = `${message}\n${error}`;
            try {
                this.toFile('DEBUG', out);
            } catch(err) {
                console.warn('Could not write to log file.', err);
            }
            console.debug(this.consoleLine('DEBUG', out));
        }
    }

    public warn(message: string, error: Error | string = ''): void {
        let out = `${message}\n${error}`;
        try {
            this.toFile('WARN', out);
        } catch(err) {
            console.warn('Could not write to log file.', err);
        }
        console.warn(this.consoleLine('WARN', out));
    }

    public error(message: string, error: Error | string = ''): void {
        let out = `${message}\n${error}`;
        try {
            this.toFile('ERR', out);
        } catch(err) {
            console.warn('Could not write to log file.', err);
        }
        console.error(this.consoleLine('ERR', out));
    }

    /**
     * Creates a new log line with the propper formatting.
     * @param flag 
     * @param message 
     */
    private fileLine(flag: string, message: string): string {
        return `[${new Date().toUTCString()}] [${flag.toUpperCase().trim()}] ${message.trim()}\n`;
    }

    /**
     * Removes the time stamp to save console space.
     * @param flag 
     * @param message 
     */
    private consoleLine(flag: string, message: string): string {
        return `[${flag.toUpperCase().trim()}] ${message.trim()}`;
    }

    private toFile(flag: string, message: string): void {
        fileStream.appendFileSync(
            this.logFilePath,
            this.fileLine(flag, message)
        );
    }
}