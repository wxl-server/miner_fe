import type { RecursiveRequired, Settings } from '#/global'
import settingsDefault from '@/settings.default'
import { merge } from '@/utils/object'
import { cloneDeep } from 'es-toolkit'

const globalSettings: Settings.all = {
  home: {
    /**
     * 是否开启主页
     * @默认值 `true`
     */
    enable: false,
  },
  app: {
    /**
     * 是否开启动态标题
     * @默认值 `false`
     */
    enableDynamicTitle: true,
  },
}

export default merge(globalSettings, cloneDeep(settingsDefault)) as RecursiveRequired<Settings.all>
