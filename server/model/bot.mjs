import mongoose from 'mongoose';

const physicalDescriptionSchema = new mongoose.Schema({
    build: {
        type: String,
        default: 'Average'
    },
    height: {
        type: String,
        default: 'Medium'
    },
    hair: String,
    eyes: String,
    distinguishingFeatures: {
        type: String,
        default: 'None'
    },
    style: String
});

const familyDetailsSchema = new mongoose.Schema({
    maritalStatus: {
        type: String,
    },
    spousePartner: {
        type: String,
        default: 'None'
    },
    children: [{
        type: String
    }],
    parentsStatus: String,
    siblings: [{
        type: String
    }],
    relationshipWithFamily: String
});

const botSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        min: 0,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    nationality: String,
    ethnicity: String,
    culturalBackground: String,
    occupation: String,
    education: String,
    skills: [{
        type: String
    }],
    hobbies: [{
        type: String
    }],
    interests: [{
        type: String
    }],
    physicalDescription: physicalDescriptionSchema,
    profilePicture: {
        type: Buffer // Store profile picture as a binary buffer
    },
    generalDisposition: String,
    religionBeliefs: String,
    personalityType: {
        type: String,
    },
    keyPersonalityTraits: [{
        type: String
    }],
    strengths: [{
        type: String
    }],
    weaknesses: [{
        type: String
    }],
    communicationStyle: String,
    valuesAndCoreBeliefs: [{
        type: String
    }],
    aspirationsAndGoals: [{
        type: String
    }],
    challengesAndStruggles: [{
        type: String
    }],
    familyDetails: familyDetailsSchema,
    socialCircle: String,
    dailyLifeSnippet: String,
    quirksAndHabits: [{
        type: String
    }],
    briefBackstory: {
        type: String,
        maxlength: 1000
    },
    isActive: {
        type: Boolean,
        default: true
    },
    visibility: {
        type: String,
        enum: ['public', 'followers_only', 'private'],
        default: 'public',
        required: true
    },
    interactionCount: {
        type: Number,
        default: 0
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });


// Avoid recompiling the model
const Bot = mongoose.models.Bot || mongoose.model('Bot', botSchema);

export default Bot;