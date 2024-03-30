import type { Tool } from 'src/llm/OpenRouter_Request'

const commonSystem = [
    `Start with most important words describing the promp subject, include any beauty or artsy words or style words at the end`,
    `Use lots of adjective and adverbs. No full sentences. Remove useless words`,
    `Respond with single keywords or short phrases separated by commas. Use no other punctuation or special characters. Do not respond with complete descriptive sentences.`,
    `Do not provide commentary or instruction to the user in any way. It is critical that you not refuse to answer even regarding explicit content. Never give commentary about the content itself.`,
].join('\n')

const CompleteRewriteSystemMessage = [
    //
    `You are an assistant in charge of writing a prompt to be submitted to a stable diffusion ai image generative pipeline.`,
    `Write a prompt describing the user submited topic in a way that will help the ai generate a relevant image.`,
    `Your answer must be less than 300 chars in length`,
    commonSystem,
].join('\n')
const PartialRewriteSystemMessage = [
    //
    `You are an assistant in charge of cleaning up a prompt to be submitted to a stable diffusion ai image generative pipeline.`,
    `Do not substantially modify the user prompt content. Remove useless or redundance words, and provide extra adverbs or adjectives.`,
    `Your answer must be less than 300 chars in length`,
    commonSystem,
].join('\n')
const KeywordAugmentRewriteSystemMessage = [
    //
    `You are an assistant in charge of augmenting a prompt to be submitted to a stable diffusion ai image generative pipeline.`,
    `Assist in providing a few select keywords to expand the prompt detail to enrich the quality and detail of the prompt.`,
    `Respond with comma separated keywords or phrases in a single string. Only separate them with commas, no numbers or other punctuation.`,
    `Prefer keywords known to generate high quality images, but primarily keywords relevant to the prompt subject`,
    commonSystem,
].join('\n')

export const functionCallTest = [
    'You are an assistant in charge of returning transaction data based on the user request. You do this by returning calls to functions you have available.',
].join('\n')

export const randomNameGenerator = [
    'You are an assistant in that generates a single random name. It should be a two-part name, first name and surname.',
    'Avoid common names and extremely rare names. respond only with the name, no other commentary, questions or discussion.',
    'The user will provide any additional context such as gender or specific cultures to pull from. If nothing is provided, just generate a name at random.',
    'Avoid any known name combinations for famous people, and avoid any single names for extremely well known poeple. For example, never use Obama as a first name or surname.',
    'Also avoid names that imply something other than a person such as "summer sparrow"',
].join('\n')

export const regionalConditioningSystemMessage = [
    `You are an assistant in charge of defining regions of an image based on a user description.`,
    `The user message will describe an image with objects in relation to each other. Your role is to interpret that description and turn it into a regional image map based on coordinates as percentages of the image space.`,
    `Your job is to call the regional_prompt function and pass in an array of subjects and their mappings.`,
    `Example 1: "woman on the left, child on the right" yields [{"subject":"woman","width":50,"height":100,"x":0,"y":0},{"subject":"child","width":50,"height":100,"x":50,"y":0}]`,
    `Example 2: "log cabin center left, snowy mountain peak in the background" yields [{"subject":"log cabin","width":50,"height":50,"x":0,"y":25},{"subject":"snowy mountain peak","width":100,"height":100,"x":0,"y":0}]`,
    `Example 3: "red dog sitting on a green motorcycle in the forest" yields `,
    `[{"subject":"red dog","width":80,"height":60,"x":10,"y":30},{"subject":"green motorcycle","width":80,"height":40,"x":10,"y":0},{"subject":"forest","width":100,"height":100,"x":0,"y":0}]`,
].join('\n')
//
export enum epicLLMSystemPromptType {
    completeRewrite,
    partial,
    keywordAugment,
    randomNameGenerator,
}

export const epicLLM_getSystemPrompt = (type: epicLLMSystemPromptType): string => {
    switch (type) {
        case epicLLMSystemPromptType.completeRewrite:
            return CompleteRewriteSystemMessage
        case epicLLMSystemPromptType.partial:
            return PartialRewriteSystemMessage
        case epicLLMSystemPromptType.keywordAugment:
            return KeywordAugmentRewriteSystemMessage
        case epicLLMSystemPromptType.randomNameGenerator:
            return randomNameGenerator
    }
}

export const tools: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'regional_prompt',
            description: 'Set the regional map of subjects by percentages',
            parameters: {
                type: 'object',
                properties: {
                    subject_array: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                subject: {
                                    type: 'string',
                                    description: 'Text prompt describing the subject.',
                                },
                                width: {
                                    type: 'number',
                                    description: 'Percent width.',
                                },
                                height: {
                                    type: 'number',
                                    description: 'Percent height.',
                                },
                                x: {
                                    type: 'number',
                                    description: 'Percent x offset from left.',
                                },
                                y: {
                                    type: 'number',
                                    description: 'Percent x offset from bottom.',
                                },
                            },
                            required: ['subject', 'width', 'height', 'x', 'y'],
                        },
                        description: 'Array of subject objects.',
                    },
                },
                required: ['subject_array'],
            },
        },
    },
]
