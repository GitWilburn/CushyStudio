import { readFileSync } from 'fs'

// prettier-ignore
export type CustomNodesInfo = {
    "author"      : string, // "Dr.Lt.Data",
    "title"       : string, // "ComfyUI-Manager",
    "reference"   : string, // "https://github.com/ltdrdata/ComfyUI-Manager",
    "files"       : string[], // ["https://github.com/ltdrdata/ComfyUI-Manager"],
    "install_type": string, // "git-clone",
    "description" : string, // "ComfyUI-Manager itself is also a custom node."
}

type CustomNodeFile = {
    custom_nodes: CustomNodesInfo[]
}

const knownCustomNodesFile: CustomNodeFile = JSON.parse(readFileSync('src/wiki/custom-node-list_.json', 'utf8'))
const knownCustomNodeList = knownCustomNodesFile.custom_nodes

export const knownCustomNodes = new Map<KnownCustomNodes, CustomNodesInfo>()
for (const customNodes of knownCustomNodeList) {
    knownCustomNodes.set(customNodes.title as KnownCustomNodes, customNodes)
}

export type KnownCustomNodes =
    | 'ComfyUI-Manager'
    | 'ComfyUI Impact Pack'
    | 'ComfyUI Inspire Pack'
    | 'ComfyUI_experiments'
    | 'stability-ComfyUI-nodes'
    | "ComfyUI's ControlNet Auxiliary Preprocessors"
    | 'ComfyUI Frame Interpolation'
    | 'ComfyUI Loopchain'
    | 'ComfyUI MotionDiff'
    | 'ComfyUI-Video-Matting'
    | 'CLIPSeg'
    | 'ComfyUI Cutoff'
    | 'Advanced CLIP Text Encode'
    | 'ComfyUI Noise'
    | 'Tiled sampling for ComfyUI'
    | 'SeeCoder [WIP]'
    | 'Efficiency Nodes for ComfyUI Version 2.0+'
    | 'ComfyUI_Jags_VectorMagic'
    | 'ComfyUI_Jags_Audiotools'
    | 'Derfuu_ComfyUI_ModdedNodes'
    | 'comfy_clip_blip_node'
    | 'Visual Area Conditioning / Latent composition'
    | 'WAS Node Suite'
    | 'ComfyUI Preset Merger'
    | 'PPF_Noise_ComfyUI'
    | 'Power Noise Suite for ComfyUI'
    | 'FreeU_Advanced'
    | 'ASTERR'
    | 'WAS_Extras'
    | 'Quality of life Suit:V2'
    | 'simple wildcard for ComfyUI'
    | 'Vid2vid'
    | 'ComfyUI-post-processing-nodes'
    | 'ImagesGrid'
    | 'ComfyUI-Vextra-Nodes'
    | 'ComfyUI-nodes-hnmr'
    | 'Masquerade Nodes'
    | "y.k.'s ComfyUI node suite"
    | 'Rembg Background Removal Node for ComfyUI'
    | 'MergeBlockWeighted_fo_ComfyUI'
    | 'trNodes'
    | 'Auto-MBW'
    | 'ComfyUI_NetDist'
    | 'Latent-Interposer'
    | 'SD-Advanced-Noise'
    | 'SD-Latent-Upscaler'
    | 'ComfyUI_DiT [WIP]'
    | 'ComfyUI_ColorMod'
    | 'Extra CustomNodes for ComfyUI'
    | 'ComfyUI-Saveaswebp'
    | 'ComfyUI-Image-Selector'
    | 'As_ComfyUI_CustomNodes'
    | 'Zuellni/ComfyUI-Custom-Nodes'
    | 'ComfyUI-ExLlama'
    | 'ComfyUI PickScore Nodes'
    | 'AlekPet/ComfyUI_Custom_Nodes_AlekPet'
    | 'ComfyUI WD 1.4 Tagger'
    | 'pythongosssss/ComfyUI-Custom-Scripts'
    | 'ComfyUI_Strimmlarns_aesthetic_score'
    | 'tinyterraNodes'
    | 'comfy-plasma'
    | 'ImageProcessing'
    | 'LatentToRGB'
    | 'ComfyUI_PerpWeight'
    | 'UltimateSDUpscale'
    | 'NestedNodeBuilder'
    | 'Restart Sampling'
    | 'ComfyUI roop'
    | 'ComfyUI fabric'
    | 'Disco Diffusion'
    | 'OpenPose Editor'
    | 'nui suite'
    | 'Allor Plugin'
    | 'MTB Nodes'
    | 'NodeGPT'
    | 'ComfyUI_Comfyroll_CustomNodes'
    | 'ComfyUI-Bmad-DirtyUndoRedo'
    | 'Bmad Nodes'
    | 'comfyui_ab_sampler'
    | 'Lists Cartesian Product'
    | 'FizzNodes'
    | 'ComfyUI-AIT'
    | 'Pixelization'
    | 'smZNodes'
    | 'ImageReward'
    | 'SeargeSDXL'
    | 'Simple Math'
    | 'ComfyUI_IPAdapter_plus'
    | 'InterpolateEverything'
    | 'comfy-easy-grids'
    | 'Comfy UI Prompt Agent'
    | 'Image to Text Node'
    | 'Comfy UI Online Loaders'
    | 'Comfy AI DoubTech.ai Image Sumission Node'
    | 'Comfy UI QR Codes'
    | 'Variables for Comfy UI'
    | 'comfyui-art-venture'
    | 'LexMSDBNodes'
    | 'pants'
    | 'ComfyMath'
    | 'comfy-nodes'
    | 'CLIP Directional Prompt Attention'
    | 'AnimateDiff'
    | 'SDXL Prompt Styler'
    | 'SDXL Prompt Styler (customized version by wolfden)'
    | 'ComfyUi_String_Function_Tree'
    | 'DZ-FaceDetailer'
    | 'ComfyUI prompt control'
    | 'ComfyUI-CADS'
    | 'asagi4/comfyui-utility-nodes'
    | 'ComfyUI - P2LDGAN Node'
    | 'Various ComfyUI Nodes by Type'
    | 'DynamicPrompts Custom Nodes'
    | 'mihaiiancu/Inpaint'
    | 'abg-comfyui'
    | 'Mikey Nodes'
    | 'failfast-comfyui-extensions'
    | 'pfaeff-comfyui'
    | 'wlsh_nodes'
    | 'ComfyUI-Advanced-ControlNet'
    | 'AnimateDiff Evolved'
    | 'ComfyUI-VideoHelperSuite'
    | 'ReActor Node for ComfyUI'
    | 'FaceSwap'
    | 'ComfyUI_Ib_CustomNodes'
    | 'One Button Prompt'
    | 'ComfyQR'
    | 'ComfyQR-scanning-nodes'
    | 'ComfyUI PixelArt Detector'
    | 'Eagle PNGInfo'
    | 'Styles CSV Loader Extension for ComfyUI'
    | 'Comfy_KepListStuff'
    | 'ComfyLiterals'
    | 'KepPromptLang'
    | 'Comfy_KepMatteAnything'
    | 'Comfy_KepKitchenSink'
    | 'ComfyUI-OtherVAEs'
    | 'ComfyUI-KepOpenAI'
    | 'ComfyUI-Fans'
    | 'ComfyUI_TravelSuite'
    | 'ComfyI2I'
    | 'ComfyUI-Logic'
    | 'SaveImgPrompt'
    | 'ComfyUI Sokes Nodes'
    | 'noise latent perlinpinpin'
    | 'LoadLoraWithTags'
    | 'sigmas_tools_and_the_golden_scheduler'
    | 'JPS Custom Nodes for ComfyUI'
    | "hus' utils for ComfyUI"
    | 'ComfyUI_Fooocus_KSampler'
    | 'LoRA Tag Loader for ComfyUI'
    | "rgthree's ComfyUI Nodes"
    | 'AIGODLIKE-COMFYUI-TRANSLATION'
    | "BilboX's ComfyUI Custom Nodes"
    | 'Save Image with Generation Metadata'
    | 'ComfyUI-send-Eagle(slim)'
    | 'ComfyUI-SDXL-EmptyLatentImage'
    | 'pfg-ComfyUI'
    | 'attention-couple-ComfyUI'
    | 'cd-tuner_negpip-ComfyUI'
    | 'LoRA-Merger-ComfyUI'
    | 'LCMSampler-ComfyUI'
    | 'asymmetric-tiling-comfyui'
    | 'GPU temperature protection'
    | 'ComfyUI-Prompt-Expansion'
    | 'ComfyUI-Background-Replacement'
    | 'ComfyUI-TeaNodes'
    | 'ComfyUI_FastVAEDecorder_SDXL'
    | 'ResolutionSelector for ComfyUI'
    | 'ControlNet-LLLite-ComfyUI'
    | 'ComfyUI-Jjk-Nodes'
    | 'SDXL Auto Prompter'
    | 'Recommended Resolution Calculator'
    | 'ComfyUI-N-Nodes'
    | 'Comfy-LFO'
    | 'bsz-cui-extras'
    | 'tdxh_node_comfyui'
    | 'ComfyWarp'
    | 'ComfyUI-Coziness'
    | 'ComfyUI-TacoNodes'
    | 'Canvas Tab'
    | 'ComfyUI Neural network latent upscale custom node'
    | 'Latent Mirror node for ComfyUI'
    | 'Embedding Picker'
    | 'ComfyUI Nodes for External Tooling'
    | 'comfy_PoP'
    | 'Dream Project Animation Nodes'
    | 'Dream Video Batches'
    | 'ComfyUI Optical Flow'
    | 'ComfyUI Easy Padding'
    | 'Character Face Swap'
    | 'Facerestore CF (Code Former)'
    | 'braintacles-nodes'
    | 'ComfyUI-Model-Manager'
    | 'ComfyUI-Image-Browsing'
    | 'comfyui-job-iterator'
    | 'ComfyUI Ricing'
    | "Otonx's Custom Nodes"
    | 'A8R8 ComfyUI Nodes'
    | 'Seamless tiling Node for ComfyUI'
    | 'Endless ️🌊✨ Nodes'
    | 'ComfyUI-HQ-Image-Save'
    | 'ComfyUI-Image-Filters'
    | 'auto nodes layout'
    | 'comfyui-prompt-reader-node'
    | 'rk-comfy-nodes'
    | 'ComfyUI Essentials'
    | 'ComfyUI-Latent-Modifiers'
    | 'Stable Diffusion Dynamic Thresholding (CFG Scale Fix)'
    | 'YARS: Yet Another Resolution Selector'
    | 'Variation seeds'
    | 'Image chooser'
    | 'Use Everywhere (UE Nodes)'
    | 'Prompt Info'
    | 'TGu Utilities'
    | "SRL's nodes"
    | 'prompt-generator'
    | 'LaMa Preprocessor [WIP]'
    | 'ComfyUI-Styles'
    | 'KJNodes for ComfyUI'
    | 'Comfyui-Lama'
    | 'Save Image Extended for ComfyUI'
    | 'ComfyUI-LexTools'
    | 'ComfyUI - Text Overlay Plugin'
    | 'avatar-graph-comfyui'
    | 'tri3d-comfyui-nodes'
    | 'segment anything'
    | 'ComfyUI-AudioScheduler'
    | 'cyberdolphin'
    | 'CrasH Utils'
    | 'ComfyUI-seam-carving'
    | 'ymc-node-suite-comfyui'
    | 'ComfyUI-Chibi-Nodes'
    | 'ComfyUI-stable-wildcards'
    | 'ComfyUI-Portrait-Maker'
    | 'ComfyUI-FaceChain'
    | 'Cute Comfy'
    | 'ComfyUI_MSSpeech_TTS'
    | 'primitive-types'
    | 'comfyui-mixlab-nodes'
    | 'Ostris Nodes ComfyUI'
    | 'Latent Consistency Model for ComfyUI'
    | 'Core ML Suite for ComfyUI'
    | 'Syrian Falcon Nodes'
    | 'LCM_Inpaint-Outpaint_Comfy'
    | 'ComfyUI_NoxinNodes'
    | 'ezXY scripts and nodes'
    | 'SimpleTiles'
    | 'ComfyUI_GradientDeepShrink'
    | 'TiledIPAdapter'
    | 'ComfyUI Fictiverse Nodes'
    | 'ComfyUI-Lora-Auto-Trigger-Words'
    | 'Comfy UI FatLabels'
    | 'noEmbryo nodes'
    | 'ComfyUI - Mask Bounding Box'
    | 'ComfyUI-Malefish-Custom-Scripts'
    | 'ComfyUI Serving toolkit'
    | 'ComfyUI-CSV-Loader'
    | 'ComfyUI-0246'
    | 'fexli-util-node-comfyui'
    | 'ComfyUI_BadgerTools'
    | 'Image Resize for ComfyUI'
    | 'Integrated Nodes for ComfyUI'
    | 'Extended Save Image for ComfyUI'
    | 'ComfyUI-Openpose-Editor-Plus'
    | 'comfyui-previewlatent'
    | 'Steerable Motion'
    | 'ComfyUI_GMIC'
    | 'ComfyBreakAnim'
    | 'ZSuite'
    | 'ComfyUI PNG Metadata'
    | 'comfyui-yanc'
    | 'Jovimetrix Composition Nodes'
    | 'select_folder_path_easy'
    | 'ComfyUi-NoodleWebcam'
    | 'feidorian-ComfyNodes'
    | 'ComfyUI-TextUtils'
    | 'ComfyUI-NegiTools'
    | 'ComfyUI-RawSaver'
    | 'ComfyUI-sampler-lcm-alternative'
    | 'ComfyUI-GTSuya-Nodes'
    | 'ComfyUI-TrollSuite'
    | 'ComfyUI_Dragos_Nodes'
    | 'comfyui-geometry'
    | 'comfyui-fitsize'
    | 'ComfyUI-SVD'
    | 'ComfyUI_toyxyz_test_nodes'
    | 'ComfyUI Stable Video Diffusion'
    | 'ComfyUI-ComfyCouple'
    | 'ComfyUI-safety-checker'
    | 'ComfyUI_Nimbus-Pack'
    | 'ComfyUI_SDXL_DreamBooth_LoRA_CustomNodes'
    | 'ComfyUI-Text_Image-Composite [WIP]'
    | 'ComfyUI-Gemini'
    | 'comfyui-portrait-master-zh-cn'
    | 'qq-nodes-comfyui'
    | 'ComfyUI-Static-Primitives'
    | 'Comfy-Photoshop-SD'
    | 'EasyCaptureNode for ComfyUI'
    | 'ComfyUI Discopixel Nodes'
    | 'ComfyUI Yolov8'
    | 'ComfyUI_Mexx_Styler'
    | 'ComfyUI_Mexx_Poster'
    | 'easy-comfy-nodes'
    | 'ComfyUI-Anchors'
    | 'Simple Wildcard'
    | 'WebDev9000-Nodes'
    | 'SComfyUI-Keyframe'
    | 'ComfyUI Diffusion Color Grading'
    | 'comfyui-prompt-format'
    | 'ComfyUI Clear Screen'
    | 'ComfyUI Menu Anchor'
    | 'ComfyUI Tab Handler'
    | 'ComfyUI Floodgate'
    | 'ComfyUI_NAIDGenerator'
    | 'ComfyUI-off-suite'
    | 'comfyui-NDI'
    | 'Touchpad two-finger gesture support for macOS'
    | 'comfyui_visual_anagram'
    | 'OpenAINode'
    | 'SpliceTools'
    | 'ComfyUI Workspace Manager - Comfyspace'
    | 'ComfyUI-MagicAnimate'
    | 'ComfyUI-Image-Tools'
    | 'ComfyUI-JaRue'
    | 'ComfyUI_Fill-Nodes'
    | 'ComfyUI_zfkun'
    | 'ComfyUI-Static-Primitives'
    | 'Comfyui-Toolbox'
    | 'ComfyUI Browser'
    | 'ComfyUI Easy Use'
    | 'ComfyUI Sequential Image Loader'
    | 'Color Enhance'
    | 'Preset Dimensions'
    | 'ComfyUI-LogicUtils'
    | 'ComfyUI Slothful Attention'
    | 'StyleAligned for ComfyUI'
    | 'demofusion-comfyui'
    | 'StableZero123-comfyui'
    | 'Marigold depth estimation in ComfyUI'
    | 'ComfyUI-GlifNodes'
    | 'ConCarneNode'
    | 'AegisFlow Utility Nodes'
    | 'Plush-for-ComfyUI'
    | 'ComfyUI-Chat-GPT-Integration'
    | 'ComfyUI-mnemic-nodes'
    | 'comfyUI-tool-2lab'
    | 'Text to video for Stable Video Diffusion in ComfyUI'
    | 'comfyui-popup_preview'
    | 'comfyui-photoshop'
    | 'RUI-Nodes'
    | 'ComfyUI-Keyframed'
    | 'ComfyUI-AudioReactive'
    | 'ComfyUI_MileHighStyler'
    | 'ComfyUI Deploy'
    | 'comfyui-portrait-master'
    | 'comfyui-prompt-composer'
    | 'ComfyUI_mozman_nodes'
    | 'rcsaquino/comfyui-custom-nodes'
    | 'zhihuige-nodes-comfyui'
    | 'IG Interpolation Nodes'
    | 'comfyui-psd2png'
    | 'comfyui-easyapi-nodes'
    | 'Primere nodes for ComfyUI'
    | 'ComfyUI-RenderRiftNodes'
    | 'ComfyUI Assistant'
    | 'ComfyUI Iterative Mixing Nodes'
    | 'LoraInfo'
    | 'ComfyUI LLaVA Captioner'
    | 'ComfyUI-ComfyRun'
    | 'ComfyUI-sudo-latent-upscale'
    | 'ComfyUI-deepcache'
    | 'Harronode'
    | 'ComfyUI-Calculation'
    | 'ComfyUI-Diffusers'
    | 'eden_comfy_pipelines'
    | 'ComfyUI-SaveAVIF'
    | 'Crystools'
    | 'ComfyUI-Paint-by-Example'
    | 'ComfyUI-DareMerge'
    | 'ComfyUI-DareMerge'
    | 'ComfyUI_StreamDiffusion'
    | 'LiamUtil'
    | 'comfyui_face_parsing'
    | 'SDXL_sizing'
    | 'Image Gallery'
    | 'graphNavigator'
    | 'diffus3/ComfyUI-extensions'
    | 'm957ymj75urz/ComfyUI-Custom-Nodes'
    | 'Waveform Extensions'
    | 'KSampler GPU'
    | 'fcSuite'
    | 'ComfyUIJasonNode'
    | 'Wildcards'
    | 'SDXLCustomAspectRatio'
    | 'comfy_meh'
    | 'Hakkun-ComfyUI-nodes'
    | 'ComfyUI A1111-like Prompt Custom Node Solution'
    | 'SDXLResolutionPresets'
    | 'comfyUI_Nodes_nicolai256'
    | 'QRNG_Node_ComfyUI'
    | 'ntdviet/comfyui-ext'
    | 'alkemann nodes'
    | 'Image loader with subfolders'
    | 'Chatbox Overlay node for ComfyUI'
    | 'ComfyUIInvisibleWatermark'
    | 'Fearnworks Custom Nodes'
    | 'Hayo comfyui nodes'
    | "TheAlly's Custom Nodes"
    | 'Custom Nodes by xss'
    | 'Image2Halftone Node for ComfyUI'
