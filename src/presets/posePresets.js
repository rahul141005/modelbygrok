/**
 * Solenne Fashion Pose Presets
 * Defines joint angles and skeletal offsets for 8 editorial stances.
 * Ensures natural human kinematics with no broken geometry or clothing clipping.
 */

export const POSE_PRESETS = {
  neutral: {
    id: "neutral",
    label: "Neutral A-Pose",
    description: "Standard relaxed editorial A-pose, ideal for wardrobe fitting.",
    torsoRot: [0, 0, 0],
    pelvisOffset: [0, 0, 0],
    headRot: [0, 0, 0],
    leftArmRot: [0, 0, 0.18],
    rightArmRot: [0, 0, -0.18],
    leftLegOffset: [0, 0, 0],
    rightLegOffset: [0, 0, 0],
    leftLegRot: [0, 0, 0],
    rightLegRot: [0, 0, 0]
  },

  relaxed: {
    id: "relaxed",
    label: "Relaxed Contrapuesto",
    description: "Classic Italian contrapuesto: weight shifted to left hip, right knee softly bent.",
    torsoRot: [0, -0.04, -0.03],
    pelvisOffset: [-0.02, -0.01, 0],
    headRot: [0.03, 0.06, 0.02],
    leftArmRot: [0.05, 0, 0.14],
    rightArmRot: [-0.05, 0, -0.22],
    leftLegOffset: [-0.01, 0, 0],
    rightLegOffset: [0.02, 0.01, 0.04],
    leftLegRot: [0, 0, 0.02],
    rightLegRot: [0.12, 0, -0.03]
  },

  editorial: {
    id: "editorial",
    label: "Editorial Runway",
    description: "Dynamic runway stride with confident shoulder poise and lifted chin.",
    torsoRot: [0.02, 0.08, 0],
    pelvisOffset: [0, 0, -0.01],
    headRot: [-0.04, -0.06, -0.01],
    leftArmRot: [-0.18, 0, 0.22],
    rightArmRot: [0.16, 0, -0.20],
    leftLegOffset: [0, 0, 0.05],
    rightLegOffset: [0, 0, -0.06],
    leftLegRot: [-0.08, 0, 0],
    rightLegRot: [0.14, 0, 0]
  },

  handOnHip: {
    id: "handOnHip",
    label: "Hand on Hip",
    description: "Chic fashion stance with right hand resting on hip and head turned.",
    torsoRot: [0, 0.06, 0.02],
    pelvisOffset: [0.018, 0, 0],
    headRot: [0, -0.08, 0.02],
    leftArmRot: [0, 0, 0.16],
    rightArmRot: [0.35, -0.32, -0.68], // elbow flared, hand on iliac crest
    leftLegOffset: [-0.015, 0, 0],
    rightLegOffset: [0.015, 0, 0.02],
    leftLegRot: [0, 0, 0],
    rightLegRot: [0.06, 0, -0.02]
  },

  oneLegRelaxed: {
    id: "oneLegRelaxed",
    label: "One-Leg Shift",
    description: "Soft casual weight shift with natural arm drape.",
    torsoRot: [0, -0.05, -0.02],
    pelvisOffset: [-0.015, 0, 0],
    headRot: [0.02, 0.05, -0.01],
    leftArmRot: [-0.06, 0, 0.16],
    rightArmRot: [0.08, 0, -0.19],
    leftLegOffset: [-0.01, 0, 0],
    rightLegOffset: [0.03, 0.008, 0.03],
    leftLegRot: [0, 0, 0.02],
    rightLegRot: [0.08, 0, -0.04]
  },

  crossedArms: {
    id: "crossedArms",
    label: "Crossed Arms",
    description: "High-fashion cross-arm editorial poise.",
    torsoRot: [-0.01, 0, 0],
    pelvisOffset: [0, 0, 0],
    headRot: [0.02, 0, 0],
    leftArmRot: [0.55, 0.45, 0.35],
    rightArmRot: [0.58, -0.45, -0.35],
    leftLegOffset: [-0.01, 0, 0],
    rightLegOffset: [0.01, 0, 0],
    leftLegRot: [0, 0, 0],
    rightLegRot: [0, 0, 0]
  },

  lookingOverShoulder: {
    id: "lookingOverShoulder",
    label: "Over Shoulder",
    description: "3/4 back posture with head turned to camera to reveal back silhouette.",
    torsoRot: [0, 0.45, 0],
    pelvisOffset: [0, 0, 0],
    headRot: [-0.02, -0.75, 0],
    leftArmRot: [0.1, 0, 0.18],
    rightArmRot: [-0.15, 0, -0.2],
    leftLegOffset: [0, 0, -0.04],
    rightLegOffset: [0, 0, 0.04],
    leftLegRot: [0.05, 0, 0],
    rightLegRot: [-0.05, 0, 0]
  },

  confident: {
    id: "confident",
    label: "Confident Stance",
    description: "Grounded fashion stance with squared shoulders and relaxed hands.",
    torsoRot: [-0.02, 0, 0],
    pelvisOffset: [0, 0, 0],
    headRot: [-0.04, 0, 0],
    leftArmRot: [0, 0, 0.22],
    rightArmRot: [0, 0, -0.22],
    leftLegOffset: [-0.025, 0, 0],
    rightLegOffset: [0.025, 0, 0],
    leftLegRot: [0, 0, -0.02],
    rightLegRot: [0, 0, 0.02]
  }
};
