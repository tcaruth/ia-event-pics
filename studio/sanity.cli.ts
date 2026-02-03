import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '2i1qgrlb', // User to update
    dataset: 'production',
  },
  studioHost: 'iaeventpics',
  deployment: {
    autoUpdates: true,
    appId: 'h1w9srkok44w5z5f9is4z2z5',
  },
})
