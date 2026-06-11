import { SystemConfig, PricingConfig, CreditConfig, DispatchConfig } from '@shared/types';
import { mockSystemConfig } from '../data/mockData.js';

let systemConfig: SystemConfig = { ...mockSystemConfig };

export const configService = {
  getSystemConfig(): SystemConfig {
    return systemConfig;
  },

  getPricingConfig(): PricingConfig {
    return systemConfig.pricing;
  },

  getCreditConfig(): CreditConfig {
    return systemConfig.credit;
  },

  getDispatchConfig(): DispatchConfig {
    return systemConfig.dispatch;
  },

  updatePricingConfig(pricing: Partial<PricingConfig>): PricingConfig {
    systemConfig.pricing = { ...systemConfig.pricing, ...pricing };
    return systemConfig.pricing;
  },

  updateCreditConfig(credit: Partial<CreditConfig>): CreditConfig {
    systemConfig.credit = { ...systemConfig.credit, ...credit };
    return systemConfig.credit;
  },

  updateDispatchConfig(dispatch: Partial<DispatchConfig>): DispatchConfig {
    systemConfig.dispatch = { ...systemConfig.dispatch, ...dispatch };
    return systemConfig.dispatch;
  },

  updateSystemConfig(config: Partial<SystemConfig>): SystemConfig {
    if (config.pricing) {
      systemConfig.pricing = { ...systemConfig.pricing, ...config.pricing };
    }
    if (config.credit) {
      systemConfig.credit = { ...systemConfig.credit, ...config.credit };
    }
    if (config.dispatch) {
      systemConfig.dispatch = { ...systemConfig.dispatch, ...config.dispatch };
    }
    return systemConfig;
  },
};
