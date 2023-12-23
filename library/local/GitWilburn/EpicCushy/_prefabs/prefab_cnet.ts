import type { Runtime } from 'src'
import type { FormBuilder } from 'src/controls/FormBuilder'
import type { OutputFor } from 'library/built-in/_prefabs/_prefabs'
import { run_cnet_openPose, ui_subform_OpenPose } from './prefab_cnet_openPose'
import { run_cnet_canny, ui_subform_Canny } from './prefab_cnet_canny'

// 🅿️ CNET UI -----------------------------------------------------------
export const ui_cnet = (form: FormBuilder) => {    
    return form.groupOpt({
        label:'ControlNet',
        items: () =>({
            useControlnetConditioningForUpscalePassIfEnabled:form.bool({default:false}),
            controlNetList: form.list({
                //
                element: () =>
                    form.choice({
                        label:'Pick=>',
                        items:() => ({
                            OpenPose:ui_subform_OpenPose(form),
                            Canny:ui_subform_Canny(form),                            
                        }),
                    })
                    
            }),
        })
    })
}

// 🅿️ CNET COMMON FORM ===================================================
export const cnet_ui_common = (form:FormBuilder)=> ({
    image:form.image({default:'cushy'}),
    strength:form.float({default:1,min:0,max:2,step:0.1}),
    startAtStepPercent:form.float({default:0,min:0,max:1,step:0.1}),
    endAtStepPercent:form.float({default:1,min:0,max:1,step:0.1}),
})

export const cnet_preprocessor_ui_common = (form:FormBuilder) => ({
    saveProcessedImage:form.bool({default:false}),
    resolution: form.int({ default: 512, min: 512, max: 1024, step: 512 }),
})

// RUN -----------------------------------------------------------
export type Cnet_args = {
    positive: _CONDITIONING
    negative: _CONDITIONING
    width: INT
    height: INT
}

export const run_cnet = async (
    //
    flow: Runtime,
    opts: OutputFor<typeof ui_cnet>,
    cnet_args: Cnet_args
) => {
    const graph = flow.nodes
    var positive = cnet_args.positive
    var negative = cnet_args.negative
    // CNET APPLY
    const cnetList = opts?.controlNetList
    
    if (cnetList) {
        for(const cnet of cnetList){            
            let image: IMAGE
            let cnet_name: Enum_ControlNetLoader_control_net_name = 'control_v11p_sd15_canny.pth'
            if(cnet.Canny)
            {
                const cnet_return_canny = await (run_cnet_canny(flow, cnet.Canny,cnet_args))
                image = cnet_return_canny.image
                cnet_name = cnet_return_canny.cnet_name
            }
            // PREPROCESSOR - POSE ===========================================================
            else if(cnet.OpenPose)
            {
                const cnet_return_openPose = await (run_cnet_openPose(flow, cnet.OpenPose,cnet_args))
                image = cnet_return_openPose.image
                cnet_name = cnet_return_openPose.cnet_name                
            }               
            
            // CONTROL NET APPLY ===========================================================
            const cnet_node = graph.ControlNetApplyAdvanced({
                positive:positive,
                negative:negative,
                image:image,
                control_net:graph.ControlNetLoader({
                    control_net_name: cnet_name,
                }),
            })
            positive = cnet_node.outputs.positive
            negative = cnet_node.outputs.negative

        }
    }
   
    return { positive, negative }
}



