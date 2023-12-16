import * as T from './TYPES_json'
import { Type } from '@sinclair/typebox'


export const asMigrationsID = (s: string): MigrationsID => s as any
export type MigrationsT = {
    /** @default: null, sqlType: TEXT */
    id?: Maybe<MigrationsID>;

    /** @default: null, sqlType: TEXT */
    name: string;

    /** @default: null, sqlType: INTEGER */
    createdAt: number;

    /** @default: null, sqlType: TEXT */
    sql: string;

}
export const MigrationsSchema = Type.Object({
    id: Type.Optional(T.Nullable(Type.String())),
    name: Type.String(),
    createdAt: Type.Number(),
    sql: Type.String(),
},{ additionalProperties: false })

export const MigrationsFields = {
    id: {cid:0,name:'id',type:'TEXT',notnull:0,dflt_value:null,pk:1},
    name: {cid:1,name:'name',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    createdAt: {cid:2,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:null,pk:0},
    sql: {cid:3,name:'sql',type:'TEXT',notnull:1,dflt_value:null,pk:0},
}


export const asUsersID = (s: string): UsersID => s as any
export type UsersT = {
    /** @default: null, sqlType: INTEGER */
    id?: Maybe<UsersID>;

    /** @default: null, sqlType: TEXT */
    firstName: string;

    /** @default: null, sqlType: TEXT */
    lastName: string;

    /** @default: null, sqlType: TEXT */
    email: string;

    /** @default: null, sqlType: TEXT */
    passwordHash: string;

}
export const UsersSchema = Type.Object({
    id: Type.Optional(T.Nullable(Type.Number())),
    firstName: Type.String(),
    lastName: Type.String(),
    email: Type.String(),
    passwordHash: Type.String(),
},{ additionalProperties: false })

export const UsersFields = {
    id: {cid:0,name:'id',type:'INTEGER',notnull:0,dflt_value:null,pk:1},
    firstName: {cid:1,name:'firstName',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    lastName: {cid:2,name:'lastName',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    email: {cid:3,name:'email',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    passwordHash: {cid:4,name:'passwordHash',type:'TEXT',notnull:1,dflt_value:null,pk:0},
}


export const asGraphID = (s: string): GraphID => s as any
export type GraphT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: GraphID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: json */
    comfyPromptJSON: T.Graph_comfyPromptJSON;

    /** @default: null, sqlType: TEXT */
    stepID?: Maybe<StepID>;

}
export const GraphSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    comfyPromptJSON: T.Graph_comfyPromptJSON_Schema,
    stepID: Type.Optional(T.Nullable(Type.String())),
},{ additionalProperties: false })

export const GraphFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    comfyPromptJSON: {cid:3,name:'comfyPromptJSON',type:'json',notnull:1,dflt_value:null,pk:0},
    stepID: {cid:4,name:'stepID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
}


export const asDraftID = (s: string): DraftID => s as any
export type DraftT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: DraftID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    title?: Maybe<string>;

    /** @default: null, sqlType: json */
    appParams: T.Draft_appParams;

    /** @default: "1", sqlType: INT */
    isOpened: number;

    /** @default: null, sqlType: TEXT */
    appID: CushyAppID;

}
export const DraftSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    title: Type.Optional(T.Nullable(Type.String())),
    appParams: T.Draft_appParams_Schema,
    isOpened: Type.Number(),
    appID: Type.String(),
},{ additionalProperties: false })

export const DraftFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    title: {cid:3,name:'title',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    appParams: {cid:4,name:'appParams',type:'json',notnull:1,dflt_value:null,pk:0},
    isOpened: {cid:5,name:'isOpened',type:'INT',notnull:1,dflt_value:'1',pk:0},
    appID: {cid:6,name:'appID',type:'TEXT',notnull:1,dflt_value:null,pk:0},
}


export const asProjectID = (s: string): ProjectID => s as any
export type ProjectT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: ProjectID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    name?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    rootGraphID: GraphID;

    /** @default: null, sqlType: TEXT */
    currentApp?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    currentDraftID?: Maybe<DraftID>;

}
export const ProjectSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    name: Type.Optional(T.Nullable(Type.String())),
    rootGraphID: Type.String(),
    currentApp: Type.Optional(T.Nullable(Type.String())),
    currentDraftID: Type.Optional(T.Nullable(Type.String())),
},{ additionalProperties: false })

export const ProjectFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    name: {cid:3,name:'name',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    rootGraphID: {cid:4,name:'rootGraphID',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    currentApp: {cid:5,name:'currentApp',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    currentDraftID: {cid:6,name:'currentDraftID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
}


export const asStepID = (s: string): StepID => s as any
export type StepT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: StepID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    name?: Maybe<string>;

    /** @default: null, sqlType: json */
    formResult: T.Step_formResult;

    /** @default: null, sqlType: json */
    formSerial: T.Step_formSerial;

    /** @default: null, sqlType: TEXT */
    outputGraphID: GraphID;

    /** @default: null, sqlType: TEXT */
    status: T.StatusT;

    /** @default: "1", sqlType: INT */
    isExpanded: number;

    /** @default: null, sqlType: TEXT */
    appID: CushyAppID;

}
export const StepSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    name: Type.Optional(T.Nullable(Type.String())),
    formResult: T.Step_formResult_Schema,
    formSerial: T.Step_formSerial_Schema,
    outputGraphID: Type.String(),
    status: Type.String(),
    isExpanded: Type.Number(),
    appID: Type.String(),
},{ additionalProperties: false })

export const StepFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    name: {cid:3,name:'name',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    formResult: {cid:4,name:'formResult',type:'json',notnull:1,dflt_value:null,pk:0},
    formSerial: {cid:5,name:'formSerial',type:'json',notnull:1,dflt_value:null,pk:0},
    outputGraphID: {cid:6,name:'outputGraphID',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    status: {cid:7,name:'status',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    isExpanded: {cid:8,name:'isExpanded',type:'INT',notnull:1,dflt_value:'1',pk:0},
    appID: {cid:9,name:'appID',type:'TEXT',notnull:1,dflt_value:null,pk:0},
}


export const asComfyPromptID = (s: string): ComfyPromptID => s as any
export type ComfyPromptT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: ComfyPromptID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    stepID: StepID;

    /** @default: null, sqlType: TEXT */
    graphID: GraphID;

    /** @default: "0", sqlType: INT */
    executed: number;

    /** @default: null, sqlType: json */
    error?: Maybe<T.ComfyPrompt_error>;

    /** @default: null, sqlType: TEXT */
    status?: Maybe<T.StatusT>;

}
export const ComfyPromptSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    stepID: Type.String(),
    graphID: Type.String(),
    executed: Type.Number(),
    error: Type.Optional(T.Nullable(T.ComfyPrompt_error_Schema)),
    status: Type.Optional(T.Nullable(Type.String())),
},{ additionalProperties: false })

export const ComfyPromptFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    stepID: {cid:3,name:'stepID',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    graphID: {cid:4,name:'graphID',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    executed: {cid:5,name:'executed',type:'INT',notnull:1,dflt_value:'0',pk:0},
    error: {cid:6,name:'error',type:'json',notnull:0,dflt_value:null,pk:0},
    status: {cid:7,name:'status',type:'TEXT',notnull:0,dflt_value:null,pk:0},
}


export const asComfySchemaID = (s: string): ComfySchemaID => s as any
export type ComfySchemaT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: ComfySchemaID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: json */
    spec: T.ComfySchema_spec;

    /** @default: null, sqlType: json */
    embeddings: T.ComfySchema_embeddings;

    /** @default: null, sqlType: TEXT */
    hostID?: Maybe<HostID>;

}
export const ComfySchemaSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    spec: T.ComfySchema_spec_Schema,
    embeddings: T.ComfySchema_embeddings_Schema,
    hostID: Type.Optional(T.Nullable(Type.String())),
},{ additionalProperties: false })

export const ComfySchemaFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    spec: {cid:3,name:'spec',type:'json',notnull:1,dflt_value:null,pk:0},
    embeddings: {cid:4,name:'embeddings',type:'json',notnull:1,dflt_value:null,pk:0},
    hostID: {cid:5,name:'hostID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
}


export const asMediaTextID = (s: string): MediaTextID => s as any
export type MediaTextT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: MediaTextID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    kind: string;

    /** @default: null, sqlType: TEXT */
    content: string;

    /** @default: null, sqlType: TEXT */
    stepID?: Maybe<StepID>;

    /** @default: "''", sqlType: TEXT */
    title: string;

}
export const MediaTextSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    kind: Type.String(),
    content: Type.String(),
    stepID: Type.Optional(T.Nullable(Type.String())),
    title: Type.String(),
},{ additionalProperties: false })

export const MediaTextFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    kind: {cid:3,name:'kind',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    content: {cid:4,name:'content',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    stepID: {cid:5,name:'stepID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    title: {cid:6,name:'title',type:'TEXT',notnull:1,dflt_value:"''",pk:0},
}


export const asMediaVideoID = (s: string): MediaVideoID => s as any
export type MediaVideoT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: MediaVideoID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    absPath?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    stepID?: Maybe<StepID>;

    /** @default: null, sqlType: TEXT */
    promptID?: Maybe<ComfyPromptID>;

    /** @default: null, sqlType: TEXT */
    filePath?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    url: string;

}
export const MediaVideoSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    absPath: Type.Optional(T.Nullable(Type.String())),
    stepID: Type.Optional(T.Nullable(Type.String())),
    promptID: Type.Optional(T.Nullable(Type.String())),
    filePath: Type.Optional(T.Nullable(Type.String())),
    url: Type.String(),
},{ additionalProperties: false })

export const MediaVideoFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    absPath: {cid:3,name:'absPath',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    stepID: {cid:4,name:'stepID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    promptID: {cid:5,name:'promptID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    filePath: {cid:6,name:'filePath',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    url: {cid:7,name:'url',type:'TEXT',notnull:1,dflt_value:null,pk:0},
}


export const asMediaImageID = (s: string): MediaImageID => s as any
export type MediaImageT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: MediaImageID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: INT */
    width?: Maybe<number>;

    /** @default: null, sqlType: INT */
    height?: Maybe<number>;

    /** @default: null, sqlType: INT */
    star?: Maybe<number>;

    /** @default: null, sqlType: json */
    infos?: Maybe<T.MediaImage_infos>;

    /** @default: null, sqlType: TEXT */
    promptID?: Maybe<ComfyPromptID>;

    /** @default: null, sqlType: TEXT */
    stepID?: Maybe<StepID>;

}
export const MediaImageSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    width: Type.Optional(T.Nullable(Type.Number())),
    height: Type.Optional(T.Nullable(Type.Number())),
    star: Type.Optional(T.Nullable(Type.Number())),
    infos: Type.Optional(T.Nullable(T.MediaImage_infos_Schema)),
    promptID: Type.Optional(T.Nullable(Type.String())),
    stepID: Type.Optional(T.Nullable(Type.String())),
},{ additionalProperties: false })

export const MediaImageFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    width: {cid:3,name:'width',type:'INT',notnull:0,dflt_value:null,pk:0},
    height: {cid:4,name:'height',type:'INT',notnull:0,dflt_value:null,pk:0},
    star: {cid:5,name:'star',type:'INT',notnull:0,dflt_value:null,pk:0},
    infos: {cid:6,name:'infos',type:'json',notnull:0,dflt_value:null,pk:0},
    promptID: {cid:7,name:'promptID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    stepID: {cid:8,name:'stepID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
}


export const asMedia3dDisplacementID = (s: string): Media3dDisplacementID => s as any
export type Media3dDisplacementT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: Media3dDisplacementID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: INT */
    width?: Maybe<number>;

    /** @default: null, sqlType: INT */
    height?: Maybe<number>;

    /** @default: null, sqlType: TEXT */
    image?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    depthMap?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    normalMap?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    stepID?: Maybe<StepID>;

    /** @default: null, sqlType: TEXT */
    promptID?: Maybe<ComfyPromptID>;

}
export const Media3dDisplacementSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    width: Type.Optional(T.Nullable(Type.Number())),
    height: Type.Optional(T.Nullable(Type.Number())),
    image: Type.Optional(T.Nullable(Type.String())),
    depthMap: Type.Optional(T.Nullable(Type.String())),
    normalMap: Type.Optional(T.Nullable(Type.String())),
    stepID: Type.Optional(T.Nullable(Type.String())),
    promptID: Type.Optional(T.Nullable(Type.String())),
},{ additionalProperties: false })

export const Media3dDisplacementFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    width: {cid:3,name:'width',type:'INT',notnull:0,dflt_value:null,pk:0},
    height: {cid:4,name:'height',type:'INT',notnull:0,dflt_value:null,pk:0},
    image: {cid:5,name:'image',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    depthMap: {cid:6,name:'depthMap',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    normalMap: {cid:7,name:'normalMap',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    stepID: {cid:8,name:'stepID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    promptID: {cid:9,name:'promptID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
}


export const asRuntimeErrorID = (s: string): RuntimeErrorID => s as any
export type RuntimeErrorT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: RuntimeErrorID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    message: string;

    /** @default: null, sqlType: json */
    infos: T.RuntimeError_infos;

    /** @default: null, sqlType: TEXT */
    promptID?: Maybe<ComfyPromptID>;

    /** @default: null, sqlType: TEXT */
    graphID?: Maybe<GraphID>;

    /** @default: null, sqlType: TEXT */
    stepID?: Maybe<StepID>;

}
export const RuntimeErrorSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    message: Type.String(),
    infos: T.RuntimeError_infos_Schema,
    promptID: Type.Optional(T.Nullable(Type.String())),
    graphID: Type.Optional(T.Nullable(Type.String())),
    stepID: Type.Optional(T.Nullable(Type.String())),
},{ additionalProperties: false })

export const RuntimeErrorFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    message: {cid:3,name:'message',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    infos: {cid:4,name:'infos',type:'json',notnull:1,dflt_value:null,pk:0},
    promptID: {cid:5,name:'promptID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    graphID: {cid:6,name:'graphID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    stepID: {cid:7,name:'stepID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
}


export const asMediaSplatID = (s: string): MediaSplatID => s as any
export type MediaSplatT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: MediaSplatID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    stepID?: Maybe<StepID>;

    /** @default: null, sqlType: TEXT */
    url: string;

}
export const MediaSplatSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    stepID: Type.Optional(T.Nullable(Type.String())),
    url: Type.String(),
},{ additionalProperties: false })

export const MediaSplatFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    stepID: {cid:3,name:'stepID',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    url: {cid:4,name:'url',type:'TEXT',notnull:1,dflt_value:null,pk:0},
}


export const asCustomDataID = (s: string): CustomDataID => s as any
export type CustomDataT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: CustomDataID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: "'{}'", sqlType: json */
    json: T.CustomData_json;

}
export const CustomDataSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    json: T.CustomData_json_Schema,
},{ additionalProperties: false })

export const CustomDataFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    json: {cid:3,name:'json',type:'json',notnull:1,dflt_value:"'{}'",pk:0},
}


export const asCushyScriptID = (s: string): CushyScriptID => s as any
export type CushyScriptT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: CushyScriptID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    path: string;

    /** @default: null, sqlType: TEXT */
    code: string;

}
export const CushyScriptSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    path: Type.String(),
    code: Type.String(),
},{ additionalProperties: false })

export const CushyScriptFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    path: {cid:3,name:'path',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    code: {cid:4,name:'code',type:'TEXT',notnull:1,dflt_value:null,pk:0},
}


export const asCushyAppID = (s: string): CushyAppID => s as any
export type CushyAppT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: CushyAppID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    guid?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    scriptID: CushyScriptID;

    /** @default: null, sqlType: TEXT */
    name?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    illustration?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    description?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    tags?: Maybe<string>;

}
export const CushyAppSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    guid: Type.Optional(T.Nullable(Type.String())),
    scriptID: Type.String(),
    name: Type.Optional(T.Nullable(Type.String())),
    illustration: Type.Optional(T.Nullable(Type.String())),
    description: Type.Optional(T.Nullable(Type.String())),
    tags: Type.Optional(T.Nullable(Type.String())),
},{ additionalProperties: false })

export const CushyAppFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    guid: {cid:3,name:'guid',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    scriptID: {cid:4,name:'scriptID',type:'TEXT',notnull:1,dflt_value:null,pk:0},
    name: {cid:5,name:'name',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    illustration: {cid:6,name:'illustration',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    description: {cid:7,name:'description',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    tags: {cid:8,name:'tags',type:'TEXT',notnull:0,dflt_value:null,pk:0},
}


export const asAuthID = (s: string): AuthID => s as any
export type AuthT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: AuthID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: TEXT */
    provider_token?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    refresh_token?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    token_type?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    access_token?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    provider_refresh_token?: Maybe<string>;

    /** @default: null, sqlType: INT */
    expires_at?: Maybe<number>;

    /** @default: null, sqlType: INT */
    expires_in?: Maybe<number>;

}
export const AuthSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    provider_token: Type.Optional(T.Nullable(Type.String())),
    refresh_token: Type.Optional(T.Nullable(Type.String())),
    token_type: Type.Optional(T.Nullable(Type.String())),
    access_token: Type.Optional(T.Nullable(Type.String())),
    provider_refresh_token: Type.Optional(T.Nullable(Type.String())),
    expires_at: Type.Optional(T.Nullable(Type.Number())),
    expires_in: Type.Optional(T.Nullable(Type.Number())),
},{ additionalProperties: false })

export const AuthFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    provider_token: {cid:3,name:'provider_token',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    refresh_token: {cid:4,name:'refresh_token',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    token_type: {cid:5,name:'token_type',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    access_token: {cid:6,name:'access_token',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    provider_refresh_token: {cid:7,name:'provider_refresh_token',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    expires_at: {cid:8,name:'expires_at',type:'INT',notnull:0,dflt_value:null,pk:0},
    expires_in: {cid:9,name:'expires_in',type:'INT',notnull:0,dflt_value:null,pk:0},
}


export const asTreeEntryID = (s: string): TreeEntryID => s as any
export type TreeEntryT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: TreeEntryID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: null, sqlType: INT */
    isExpanded?: Maybe<number>;

}
export const TreeEntrySchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    isExpanded: Type.Optional(T.Nullable(Type.Number())),
},{ additionalProperties: false })

export const TreeEntryFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    isExpanded: {cid:3,name:'isExpanded',type:'INT',notnull:0,dflt_value:null,pk:0},
}


export const asHostID = (s: string): HostID => s as any
export type HostT = {
    /** @default: "hex(randomblob(16))", sqlType: string */
    id: HostID;

    /** @default: "now", sqlType: INTEGER */
    createdAt: number;

    /** @default: "now", sqlType: INTEGER */
    updatedAt: number;

    /** @default: "hex(randomblob(16))", sqlType: TEXT */
    name: string;

    /** @default: "\"localhost\"", sqlType: TEXT */
    hostname: string;

    /** @default: "8188", sqlType: INT */
    port: number;

    /** @default: "0", sqlType: INT */
    useHttps: number;

    /** @default: "0", sqlType: INT */
    isLocal: number;

    /** @default: null, sqlType: TEXT */
    absolutePathToComfyUI?: Maybe<string>;

    /** @default: null, sqlType: TEXT */
    absolutPathToDownloadModelsTo?: Maybe<string>;

    /** @default: "0", sqlType: INT */
    isVirtual: number;

}
export const HostSchema = Type.Object({
    id: Type.String(),
    createdAt: Type.Number(),
    updatedAt: Type.Number(),
    name: Type.String(),
    hostname: Type.String(),
    port: Type.Number(),
    useHttps: Type.Number(),
    isLocal: Type.Number(),
    absolutePathToComfyUI: Type.Optional(T.Nullable(Type.String())),
    absolutPathToDownloadModelsTo: Type.Optional(T.Nullable(Type.String())),
    isVirtual: Type.Number(),
},{ additionalProperties: false })

export const HostFields = {
    id: {cid:0,name:'id',type:'string',notnull:1,dflt_value:'hex(randomblob(16))',pk:1},
    createdAt: {cid:1,name:'createdAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    updatedAt: {cid:2,name:'updatedAt',type:'INTEGER',notnull:1,dflt_value:'now',pk:0},
    name: {cid:3,name:'name',type:'TEXT',notnull:1,dflt_value:'hex(randomblob(16))',pk:0},
    hostname: {cid:4,name:'hostname',type:'TEXT',notnull:1,dflt_value:'"localhost"',pk:0},
    port: {cid:5,name:'port',type:'INT',notnull:1,dflt_value:'8188',pk:0},
    useHttps: {cid:6,name:'useHttps',type:'INT',notnull:1,dflt_value:'0',pk:0},
    isLocal: {cid:7,name:'isLocal',type:'INT',notnull:1,dflt_value:'0',pk:0},
    absolutePathToComfyUI: {cid:8,name:'absolutePathToComfyUI',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    absolutPathToDownloadModelsTo: {cid:9,name:'absolutPathToDownloadModelsTo',type:'TEXT',notnull:0,dflt_value:null,pk:0},
    isVirtual: {cid:10,name:'isVirtual',type:'INT',notnull:1,dflt_value:'0',pk:0},
}


export const schemas = {
    migrations: new T.TableInfo(
        'migrations',
        'Migrations',
        MigrationsFields,
        MigrationsSchema,
    ),
    users: new T.TableInfo(
        'users',
        'Users',
        UsersFields,
        UsersSchema,
    ),
    graph: new T.TableInfo(
        'graph',
        'Graph',
        GraphFields,
        GraphSchema,
    ),
    draft: new T.TableInfo(
        'draft',
        'Draft',
        DraftFields,
        DraftSchema,
    ),
    project: new T.TableInfo(
        'project',
        'Project',
        ProjectFields,
        ProjectSchema,
    ),
    step: new T.TableInfo(
        'step',
        'Step',
        StepFields,
        StepSchema,
    ),
    comfy_prompt: new T.TableInfo(
        'comfy_prompt',
        'ComfyPrompt',
        ComfyPromptFields,
        ComfyPromptSchema,
    ),
    comfy_schema: new T.TableInfo(
        'comfy_schema',
        'ComfySchema',
        ComfySchemaFields,
        ComfySchemaSchema,
    ),
    media_text: new T.TableInfo(
        'media_text',
        'MediaText',
        MediaTextFields,
        MediaTextSchema,
    ),
    media_video: new T.TableInfo(
        'media_video',
        'MediaVideo',
        MediaVideoFields,
        MediaVideoSchema,
    ),
    media_image: new T.TableInfo(
        'media_image',
        'MediaImage',
        MediaImageFields,
        MediaImageSchema,
    ),
    media_3d_displacement: new T.TableInfo(
        'media_3d_displacement',
        'Media3dDisplacement',
        Media3dDisplacementFields,
        Media3dDisplacementSchema,
    ),
    runtime_error: new T.TableInfo(
        'runtime_error',
        'RuntimeError',
        RuntimeErrorFields,
        RuntimeErrorSchema,
    ),
    media_splat: new T.TableInfo(
        'media_splat',
        'MediaSplat',
        MediaSplatFields,
        MediaSplatSchema,
    ),
    custom_data: new T.TableInfo(
        'custom_data',
        'CustomData',
        CustomDataFields,
        CustomDataSchema,
    ),
    cushy_script: new T.TableInfo(
        'cushy_script',
        'CushyScript',
        CushyScriptFields,
        CushyScriptSchema,
    ),
    cushy_app: new T.TableInfo(
        'cushy_app',
        'CushyApp',
        CushyAppFields,
        CushyAppSchema,
    ),
    auth: new T.TableInfo(
        'auth',
        'Auth',
        AuthFields,
        AuthSchema,
    ),
    tree_entry: new T.TableInfo(
        'tree_entry',
        'TreeEntry',
        TreeEntryFields,
        TreeEntrySchema,
    ),
    host: new T.TableInfo(
        'host',
        'Host',
        HostFields,
        HostSchema,
    ),
}