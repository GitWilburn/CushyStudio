import type { Entity } from '../../model/Entity'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { ISchema } from '../../model/ISchema'
import type { Problem_Ext } from '../../model/Validation'

import { nanoid } from 'nanoid'

import { Field } from '../../model/Field'
import { registerWidgetClass } from '../WidgetUI.DI'
import { clampMod, mkEnglishSummary } from './_orbitUtils'
import { WidgetOrbitUI } from './WidgetOrbitUI'

export type OrbitData = {
    azimuth: number
    elevation: number
}

// CONFIG
export type Field_orbit_config = FieldConfig<{ default?: Partial<OrbitData> }, Field_orbit_types>

// SERIAL
export type Field_orbit_serial = FieldSerial<{
    type: 'orbit'
    value: OrbitData
}>

// SERIAL FROM VALUE
export const Field_orbit_fromValue = (value: Field_orbit_value): Field_orbit_serial => ({
    type: 'orbit',
    value: {
        azimuth: value.azimuth,
        elevation: value.elevation,
    },
})

// VALUE
export type Field_orbit_value = {
    azimuth: number
    elevation: number
    englishSummary: string
}

// TYPES
export type Field_orbit_types = {
    $Type: 'orbit'
    $Config: Field_orbit_config
    $Serial: Field_orbit_serial
    $Value: Field_orbit_value
    $Field: Field_orbit
}

// STATE
export class Field_orbit extends Field<Field_orbit_types> {
    DefaultHeaderUI = WidgetOrbitUI
    DefaultBodyUI = undefined
    readonly id: string
    static readonly type: 'orbit' = 'orbit'
    readonly type: 'orbit' = 'orbit'

    get baseErrors(): Problem_Ext {
        return null
    }

    get defaultAzimuth() {
        return this.config.default?.azimuth ?? 0
    }
    get defaultElevation() {
        return this.config.default?.elevation ?? 0
    }
    get hasChanges(): boolean {
        if (this.serial.value.azimuth !== this.defaultAzimuth) return true
        if (this.serial.value.elevation !== this.defaultElevation) return true
        return false
    }
    /** reset azimuth and elevation */
    reset(): void {
        this.serial.value.azimuth = this.defaultAzimuth
        this.serial.value.elevation = this.defaultElevation
    }

    /** practical to add to your textual prompt */
    get englishSummary() {
        return mkEnglishSummary(
            //
            this.serial.value.azimuth,
            this.serial.value.elevation,
        )
    }

    get euler() {
        const radius = 5
        const azimuthRad = this.serial.value.azimuth * (Math.PI / 180)
        const elevationRad = this.serial.value.elevation * (Math.PI / 180)
        const x = radius * Math.cos(elevationRad) * Math.sin(azimuthRad)
        const y = radius * Math.cos(elevationRad) * Math.cos(azimuthRad)
        const z = radius * Math.sin(elevationRad)
        // const cameraPosition =[x,y,z] as const
        return { x: y, y: z, z: -x }
    }

    serial: Field_orbit_serial

    constructor(
        //
        entity: Entity,
        parent: Field | null,
        schema: ISchema<Field_orbit>,
        serial?: Field_orbit_serial,
    ) {
        super(entity, parent, schema)
        this.id = serial?.id ?? nanoid()
        const config = schema.config
        this.serial = serial ?? {
            type: 'orbit',
            collapsed: config.startCollapsed,
            value: {
                azimuth: config.default?.azimuth ?? 0,
                elevation: config.default?.elevation ?? 0,
            },
            id: this.id,
        }

        /* 💊 BACKWARD COMPAT */
        /* 💊 */ const serialAny = this.serial as any
        /* 💊 */ if (serialAny.val && serialAny.value == null) serialAny.value = serialAny.val

        this.init({
            DefaultHeaderUI: false,
            DefaultBodyUI: false,
        })
    }

    // x: Partial<number> = 0
    setForZero123 = (p: { azimuth_rad: number; elevation_rad: number }) => {
        this.serial.value.azimuth = clampMod(-90 + p.azimuth_rad * (180 / Math.PI), -180, 180)
        this.serial.value.elevation = clampMod(90 - p.elevation_rad * (180 / Math.PI), -180, 180) // (Math.PI / 4 - curr.getPolarAngle()) * (180 / Math.PI)
    }

    get value(): Field_orbit_value {
        return {
            azimuth: this.serial.value.azimuth,
            elevation: this.serial.value.elevation,
            englishSummary: this.englishSummary,
        }
    }

    set value(val: Field_orbit_value) {
        this.serial.value.azimuth = val.azimuth
        this.serial.value.elevation = val.elevation
        this.applyValueUpdateEffects()
    }
}

// DI
registerWidgetClass<Field_orbit>('orbit', Field_orbit)
