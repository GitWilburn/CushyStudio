import type { ImageAndMask, Runtime, Widget_bool, Widget_enum, Widget_float, Widget_group, Widget_groupOpt, Widget_group_output, Widget_image, Widget_int } from 'src'
import type { FormBuilder } from 'src/controls/FormBuilder'
import { OutputFor } from 'library/CushyStudio/default/_prefabs'
import { ImageAnswer } from 'src/controls/misc/InfoAnswer'
import { ComfyWorkflowBuilder } from 'src/back/NodeBuilder';
import { run_OpenPose, ui_OpenPose } from './_preprocessors/pose_OpenPose';

// CNET -----------------------------------------------------------
export const ui_cnet = (form: FormBuilder) => {    
    return form.group({
        label:'Control',
        items: () => ({
            selected_cnet:form.choice({
                label:'=>',
                items:()=>({
                    openPose:ui_OpenPose(form),
                })
            }),
        }),
    })
}

// RUN -----------------------------------------------------------
export const run_cnet = async (p:{
    //
    flow: Runtime,
    opts: OutputFor<typeof ui_cnet>,
    positive: _CONDITIONING
}) => {
    const graph = p.flow.nodes

    // CNET APPLY
    // let cnetApply: ControlNetApply = graph.ControlNetApply({conditioning: p.positive, control_net: graph.ControlNetLoader({control_net_name:p.opts.cnet_model_name}),
    //                 image: (p.opts.preprocessor)
    //                 ?await(run_OpenPose({flow:p.flow,opts:p.opts.preprocessor.cnet_preprocessor,original_image:p.opts.image}))
    //                 :await p.flow.loadImageAnswer(p.opts.image),
    //                 strength: p.opts.strength,})    
   
    // let positive:_CONDITIONING = cnetApply._CONDITIONING
    let positive:_CONDITIONING = p.positive
    return { positive }
}

export interface PreprocessorConfig {
    ui: (form: FormBuilder) => any;  // Replace 'any' with more specific types as needed
    run: (context: { runtime: Runtime; graph: ComfyWorkflowBuilder }, form: FormBuilder, params: { image: _IMAGE }) => { image: _IMAGE }; 
}

export function exposePreprocessor(config: PreprocessorConfig): any {
    // Example implementation:
    return {
        ui: config.ui,
        run: config.run
    };
}

