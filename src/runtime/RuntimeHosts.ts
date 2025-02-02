import { makeAutoObservable } from 'mobx'
import { HostL } from 'src/models/Host'
import { Runtime } from './Runtime'

/** namespace for all host-related utils */
export class RuntimeHosts {
    constructor(private rt: Runtime) {
        makeAutoObservable(this)
    }

    /**
     * download a file in a host
     * alias to `host.downloadFileIfMissing(url, path)`
     */
    downloadFileIfMissing = async (p: { host: HostL; url: string; path: string }) => {
        return p.host.downloadFileIfMissing(p.url, p.path)
    }

    /**
     * list of all configured hosts (machines) available
     * example usage:
     * - usefull if you want to manually dispatch things
     * */
    get all(): HostL[] {
        return this.rt.st.db.hosts.findAll()
    }

    /**
     * main host (used for typechecking)
     * by default, prompts are sent to this host
     */
    get main(): HostL {
        return this.rt.st.mainHost
    }
}
