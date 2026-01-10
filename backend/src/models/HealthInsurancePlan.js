const mongoose = require('mongoose');

const healthInsurancePlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Individual', 'Family', 'Senior Citizen', 'Critical Illness', 'Group']
  },
  sumInsured: {
    type: Number,
    required: true,
    min: 100000
  },
  premium: {
    monthly: {
      type: Number,
      required: true,
      min: 0
    },
    annual: {
      type: Number,
      required: true,
      min: 0
    }
  },
  ageRange: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      max: 100
    }
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    covered: {
      type: Boolean,
      default: true
    }
  }],
  coverage: {
    hospitalization: {
      type: Boolean,
      default: true
    },
    daycare: {
      type: Boolean,
      default: true
    },
    prePostHospitalization: {
      days: {
        type: Number,
        default: 60
      },
      covered: {
        type: Boolean,
        default: true
      }
    },
    ambulance: {
      type: Boolean,
      default: true
    },
    roomRent: {
      limit: {
        type: String,
        default: "No Limit"
      },
      covered: {
        type: Boolean,
        default: true
      }
    },
    icu: {
      type: Boolean,
      default: true
    },
    surgery: {
      type: Boolean,
      default: true
    },
    maternity: {
      type: Boolean,
      default: false
    },
    dental: {
      type: Boolean,
      default: false
    },
    opd: {
      type: Boolean,
      default: false
    }
  },
  waitingPeriods: {
    initial: {
      type: Number,
      default: 30
    },
    preExisting: {
      type: Number,
      default: 1095
    },
    specificDiseases: {
      type: Number,
      default: 730
    }
  },
  networkHospitals: {
    type: Number,
    required: true,
    min: 1000
  },
  cashlessHospitals: {
    type: Number,
    required: true,
    min: 500
  },
  claimSettlementRatio: {
    type: Number,
    required: true,
    min: 70,
    max: 100
  },
  renewalAge: {
    type: Number,
    required: true,
    min: 65
  },
  coPayment: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    applicable: {
      type: Boolean,
      default: false
    }
  },
  subLimits: [{
    category: {
      type: String,
      required: true
    },
    limit: {
      type: String,
      required: true
    }
  }],
  addOns: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    premium: {
      type: Number,
      required: true
    }
  }],
  benefits: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  exclusions: [{
    category: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.0
  },
  popular: {
    type: Boolean,
    default: false
  },
  recommended: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better query performance
healthInsurancePlanSchema.index({ type: 1, sumInsured: 1 });
healthInsurancePlanSchema.index({ premium: 1 });
healthInsurancePlanSchema.index({ popular: -1, rating: -1 });

module.exports = mongoose.model('HealthInsurancePlan', healthInsurancePlanSchema);