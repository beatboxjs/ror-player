import { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest/presets/default-esm',
    transform: {
        '^.+\\.ts?$': ['ts-jest', { useESM: true }]
    },
    globals: {
        document: {
            title: 'RoR Player'
        }
    },
};

export default config;
