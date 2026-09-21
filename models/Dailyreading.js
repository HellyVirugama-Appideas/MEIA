const mongoose = require("mongoose");

const DailyReadingSchema = new mongoose.Schema(
{
    date:{
        type:Date,
        required:true
    }, 

    moonPhase:{
        type:String,
        required:true,
        enum:[
            "New Moon",
            "Waxing Crescent",
            "First Quarter",
            "Waxing Gibbous",
            "Full Moon",
            "Waning Gibbous",
            "Last Quarter",
            "Waning Crescent"
        ]
    },

    heroImage:{
        type:String,
        default:""
    },

    title:{
        type:String,
        required:true
    },

    summary:String,

    content:{
        type:String,
        required:true
    },

    readTimeMinutes:{
        type:Number,
        default:3
    },

    cycleAstralSynergy:String,

    // "Cosmic Self-Care Rituals" block (Move / Nourish / Mindset paragraph),
    // same free-text pattern as cycleAstralSynergy above. Was missing before -
    // this section on the "Daily reading" detail screen had nowhere to come from.
    cosmicSelfCareRituals:String,

    cosmicSelfCheck:[
        {
            prompt:String,
            type:{
                type:String,
                enum:["mood","energy","insight"]
            }
        }
    ],

    moonPhaseGuidance:[
        {
            title:String,
            description:String
        }
    ],

    creativeRitual:{
        // title:String,
        // description:String,
        buttonText:{
            type:String,
            default:"Continue Ritual"
        }
    },

    eveningReflectionPrompt:String,

    estimatedCompletion:{
        type:Number,
        default:100
    },

    isActive:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
});

module.exports=mongoose.model("DailyReading",DailyReadingSchema);