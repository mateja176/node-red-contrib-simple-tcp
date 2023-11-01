/* eslint-disable immutable/no-this */

import type { EditorNodePropertyDef } from 'node-red'

const defaults = {
  name: { value: '' },
  host: { value: '255.255.255.255' },
  port: { value: 1234 },
  timeout: { value: 2000 },
} satisfies {
  name: EditorNodePropertyDef<string>
  host: EditorNodePropertyDef<string>
  port: EditorNodePropertyDef<number>
  timeout: EditorNodePropertyDef<number>
}

RED.nodes.registerType('simpleTcp', {
  category: 'network',
  color: '#e87d7d',
  defaults,
  inputs: 1,
  outputs: 1,
  label: function () {
    return this.name || 'simple tcp'
  },
  icon: 'icons/simpleTcp.png',
})
