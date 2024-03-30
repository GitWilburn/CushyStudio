import type { OpenRouter_Models } from '../llm/OpenRouter_models'
import type { OpenRouterRequest } from '../llm/OpenRouter_Request'
import type { OpenRouterResponse } from '../llm/OpenRouter_Response'
import type { Runtime } from './Runtime'

import { makeAutoObservable } from 'mobx'

import { OpenRouter_ask } from '../llm/OpenRouter_ask'
import { openRouterInfos } from '../llm/OpenRouter_infos'

/** namespace for all store-related utils */
export class RuntimeLLM {
    constructor(private rt: Runtime) {
        makeAutoObservable(this)
    }

    // ---------------------------
    // LOCAL LLM PART GOES HERE
    // 👉 .. TODO
    // ---------------------------

    /** verify key is ready */
    isConfigured = async () => {
        return !!this.rt.Cushy.configFile.value.OPENROUTER_API_KEY
    }

    /** geenric function to ask open router anything */
    ask_OpenRouter = async (p: OpenRouterRequest): Promise<OpenRouterResponse> => {
        return await OpenRouter_ask(this.rt.Cushy.configFile.value.OPENROUTER_API_KEY, p)
    }

    /** dictionary of all known openrouter models */
    allModels = openRouterInfos

    defaultSystemPrompt = [
        //
        `You are an assistant in charge of writing a prompt to be submitted to a stable distribution ai image generative pipeline.`,
        `Write a prompt describing the user submited topic in a way that will help the ai generate a relevant image.`,
        `Your answer must be arond 500 chars in length`,
        `Start with most important words describing the prompt`,
        `Include lots of adjective and adverbs. no full sentences. remove useless words`,
        `try to include a long list of comma separated words.`,
        'Once main keywords are in, if you still have character to add, include vaiours beauty or artsy words',
        `ONLY answer with the prompt itself. DO NOT answer anything else. No Hello, no thanks, no signature, no nothing.`,
    ].join('\n')

    simpleSystemPrompt = [
        //
        `You are an assistant in charge of writing a prompt to be submitted to a stable distribution ai image generative pipeline.`,
        `Write a prompt describing the user submited topic in a way that will help the ai generate a relevant image.`,
        `Start with most important words describing the prompt`,
        `ONLY answer with the prompt itself. DO NOT answer anything else. No Hello, no thanks, no signature, no nothing.`,
    ].join('\n')

    simpleSystemPromptKeywordList = [
        //
        `You are an assistant in charge of writing a prompt to be submitted to a stable distribution ai image generative pipeline.`,
        `Write a prompt describing the user submited topic in a way that will help the ai generate a relevant image.`,
        `Start with most important words describing the prompt`,
        `ONLY answer with the prompt itself. DO NOT answer anything else. No Hello, no thanks, no signature, no nothing.`,
        `Answer must be a list of COMA-SEPARATED words (or 2-3 words), no full sentences.`,
        `Wrap the most important words with parenthesis: (like this)`,
        `try to include a long list of comma separated words.`,
    ].join('\n')

    simpleSystemPromptNaturalLanguage = [
        //
        `You are an assistant in charge of writing a prompt to be submitted to a stable distribution ai image generative pipeline.`,
        `Write a prompt describing the user submited topic in a way that will help the ai generate a relevant image.`,
        `Start with most important words describing the prompt`,
        `ONLY answer with the prompt itself. DO NOT answer anything else. No Hello, no thanks, no signature, no nothing.`,
        `Answer must be done in natural passive sentences. No imperative. No direct order. No instruction. just descriptions of scene`,
        `Wrap the most important words with parenthesis: (like this)`,
        `try to include a long list of comma separated words.`,
    ].join('\n')

    /** turn any simple prompt into a better one by asking a LLM to rewrite it */
    expandPrompt = async (
        userRequest: string,
        model: OpenRouter_Models = 'openai/gpt-3.5-turbo-instruct',
        systemPrompt: string = this.defaultSystemPrompt,
    ): Promise<{
        prompt: string
        llmResponse: OpenRouterResponse
    }> => {
        return this.runSystemPrompt(model, systemPrompt, userRequest)
    }

    runSystemPrompt = async (
        /**
         * the list of all openRouter models available
         * 🔶 may not be up-to-date; last updated on 2023-12-03
         * */
        model: OpenRouter_Models = 'openai/gpt-3.5-turbo-instruct',
        /** master prompt that define how to answer the user request */
        systemPrompt: string = this.defaultSystemPrompt,
        /** description / instruction of  */
        userRequest: string,
    ): Promise<{
        prompt: string
        llmResponse: OpenRouterResponse
    }> => {
        console.log('When sent, the system prompt is this: ', systemPrompt)
        const res: OpenRouterResponse = await OpenRouter_ask(this.rt.Cushy.configFile.value.OPENROUTER_API_KEY, {
            max_tokens: 300,
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userRequest },
                // { role: 'user', content: 'Who are you?' },
            ],
        })
        if (res.choices.length === 0) throw new Error('no choices in response')
        const msg0 = res.choices[0]!.message
        if (msg0 == null) throw new Error('choice 0 is null')
        if (typeof msg0 === 'string') throw new Error('choice 0 seems to be an error')
        return {
            prompt: msg0.content ?? '',
            llmResponse: res,
        }
    }
    /** Request the LLM to return a function call */
    functionCall = async (
        /** description / instruction of  */
        basePrompt: string,
        model: OpenRouter_Models = 'openai/gpt-3.5-turbo-instruct',
        systemPrompt: string = this.defaultSystemPrompt,
        tools?: Tool[],
        tool_choice: ToolChoice = 'auto',
    ): Promise<{
        prompt: string
        llmResponse: OpenRouterResponse
    }> => {
        const res: OpenRouterResponse = await OpenRouter_ask(this.rt.Cushy.configFile.value.OPENROUTER_API_KEY, {
            max_tokens: 300,
            model: model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: basePrompt,
                },
            ],
            tools,
            tool_choice,
        })
        if (res.choices.length === 0) throw new Error('no choices in response')
        const msg0 = res.choices[0].message
        if (msg0 == null) throw new Error('choice 0 is null')
        if (typeof msg0 === 'string') throw new Error('choice 0 seems to be an error')

        // console.log('[⚡⚡]msg0' + JSON.stringify(msg0))

        // if (typeof msg0 === 'object' && msg0 !== null) {
        //     //this seems to be the way that chatGPT responds,
        //     if (msg0.tool_calls) {
        //         msg0.tool_calls.forEach((tool_call) => {
        //             const function_name = tool_call.function.name
        //             const function_params = JSON.parse(tool_call.function.arguments)

        //             console.log('[⚡⚡]function_params' + JSON.stringify(function_params))

        //             const functionObject = functionsMap[function_name]

        //             if (functionObject && typeof functionObject.func === 'function') {
        //                 const functionResult = functionObject.func(function_params)
        //                 console.log('[⚡⚡]functionResult:' + functionResult)
        //             } else {
        //                 throw new Error(`Function ${function_name} is not allowed or does not exist.`)
        //             }
        //         })
        //     } else if (msg0.content) {
        //         //try to parse the message because it seems like mistral responds in this format
        //         const parsedMessage = JSON.parse(msg0.content)
        //         // console.log('[⚡⚡]parsedMessage' + JSON.stringify(parsedMessage))
        //         if (parsedMessage.function) {
        //             const function_name = parsedMessage.function
        //             const function_params = parsedMessage.parameters
        //             // console.log('[⚡⚡]function_params' + JSON.stringify(function_params))

        //             const functionObject = functionsMap[function_name]

        //             if (functionObject && typeof functionObject.func === 'function') {
        //                 const functionResult = functionObject.func(function_params)
        //                 console.log('[⚡⚡]functionResult:' + functionResult)
        //             } else {
        //                 throw new Error(`Function ${function_name} is not allowed or does not exist.`)
        //             }
        //         } else {
        //             console.log('[⚡⚡🔴]Error - no .function')
        //         }
        //     }
        // }

        return {
            prompt: msg0.content ?? '',
            llmResponse: res,
        }
    }
}
