/* eslint-disable immutable/no-this */

import type { EditorNodePropertyDef } from 'node-red'

const defaults = {
  name: { value: 'Simple TCP' },
  host: { value: '255.255.255.255' },
  port: { value: 1234 },
} satisfies {
  name: EditorNodePropertyDef<string>
  host: EditorNodePropertyDef<string>
  port: EditorNodePropertyDef<number>
}

RED.nodes.registerType('simpleTcp', {
  category: 'network',
  color: '#e87d7d',
  defaults,
  inputs: 1,
  outputs: 1,
  icon: 'icon.svg',
  label: function () {
    return this.name || defaults.name.value
  },
})
