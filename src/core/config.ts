import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenvConfig();

interface DiscordConfig {
  bUseDiscordBot: boolean;
  bot_token: string;
}

interface MongoDBConfig {
  database: string;
}

interface ChatConfig {
  EnableGlobalChat: boolean;
}

interface WebsiteConfig {
  bUseWebsite: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  websiteport: number;
}

interface ItemShopConfig {
  bUseAutoRotate: boolean;
  bEnableAutoRotateDebugLogs: boolean;
  bEnableDiscordWebhook: boolean;
  bSeasonlimit: number;
  bRotateTime: string;
  bItemShopWebhook: string;
  bDailyItemsAmount: number;
  bFeaturedItemsAmount: number;
}

interface EventConfig {
  bEnableGeodeEvent: boolean;
  geodeEventStartDate: string;
  bEnableCrackInTheSky: boolean;
  bEnableS4OddityPrecursor: boolean;
  bEnableS4OddityExecution: boolean;
  S4OddityEventStartDate: string;
  S4OddityEventsInterval: number;
  bEnableS5OddityPrecursor: boolean;
  S5OddityPrecursorDate: string;
  bEnableS5OddityExecution: boolean;
  S5OddityExecutionDate: string;
  bEnableCubeLightning: boolean;
  cubeSpawnDate: string;
  bEnableBlockbusterRiskyEvent: boolean;
  bEnableCubeLake: boolean;
  cubeLakeDate: string;
}

interface Config {
  moderators: string[];
  discord: DiscordConfig;
  mongodb: MongoDBConfig;
  chat: ChatConfig;
  bEnableDebugLogs: boolean;
  bEnableRebootUser: boolean;
  bEnableCrossBans: boolean;
  port: number;
  Website: WebsiteConfig;
  matchmakerIP: string;
  gameServerIP: string[];
  bEnableBattlepass: boolean;
  bBattlePassSeason: number;
  bEnableReports: boolean;
  bReportChannelId: string;
  bCompletedSeasonalQuests: boolean;
  bEnableSACRewards: boolean;
  bPercentageSACRewards: number;
  itemShop: ItemShopConfig;
  events: EventConfig;
}

const defaultConfig: Config = {
  moderators: [],
  discord: {
    bUseDiscordBot: false,
    bot_token: '',
  },
  mongodb: {
    database: 'mongodb://127.0.0.1/Volta',
  },
  chat: {
    EnableGlobalChat: false,
  },
  bEnableDebugLogs: false,
  bEnableRebootUser: true,
  bEnableCrossBans: false,
  port: 3551,
  Website: {
    bUseWebsite: false,
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    websiteport: 100,
  },
  matchmakerIP: '',
  gameServerIP: [],
  bEnableBattlepass: false,
  bBattlePassSeason: 2,
  bEnableReports: false,
  bReportChannelId: '',
  bCompletedSeasonalQuests: false,
  bEnableSACRewards: false,
  bPercentageSACRewards: 0,
  itemShop: {
    bUseAutoRotate: false,
    bEnableAutoRotateDebugLogs: false,
    bEnableDiscordWebhook: false,
    bSeasonlimit: 10,
    bRotateTime: '00:00',
    bItemShopWebhook: '',
    bDailyItemsAmount: 6,
    bFeaturedItemsAmount: 2,
  },
  events: {
    bEnableGeodeEvent: false,
    geodeEventStartDate: '2020-01-01T00:00:00.000Z',
    bEnableCrackInTheSky: false,
    bEnableS4OddityPrecursor: false,
    bEnableS4OddityExecution: false,
    S4OddityEventStartDate: '2020-01-01T00:00:00.000Z',
    S4OddityEventsInterval: 0,
    bEnableS5OddityPrecursor: false,
    S5OddityPrecursorDate: '2020-01-01T00:00:00.000Z',
    bEnableS5OddityExecution: false,
    S5OddityExecutionDate: '2020-01-01T00:00:00.000Z',
    bEnableCubeLightning: false,
    cubeSpawnDate: '2020-01-01T00:00:00.000Z',
    bEnableBlockbusterRiskyEvent: false,
    bEnableCubeLake: false,
    cubeLakeDate: '2020-01-01T00:00:00.000Z',
  },
};
function loadConfig(): Config {
  const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../Config/config.json');
  let loadedConfig: Partial<Config> = {};

  if (fs.existsSync(configPath)) {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    loadedConfig = JSON.parse(fileContent);
  }

  return { ...defaultConfig, ...loadedConfig };
}

export const config: Config = loadConfig();