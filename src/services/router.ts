import VueRouter, { RouteConfig } from 'vue-router'
import About from '../ui/overview/about'
import Listen from  '../ui/listen/listen'
import PatternPlayer from '../ui/pattern-player/pattern-player'
import TuneInfo from '../ui/tune-info/tune-info'
import Compose from '../ui/compose/compose'
import SongPlayer from '../ui/song-player/song-player'
import { stopAllPlayers } from './player'

const routes : RouteConfig[] = [
    {
      path: '/',
      component: About, 
      name: 'about'
    },
    { 
        path: '/listen', 
        component: Listen,
        children: [ {
            path:'',
            component: TuneInfo,
            meta: { showNav: true },
            props: { tuneName: 'General Breaks' }
        } ]
    },
    {
        path: '/listen/:tuneName',
        props: true,
        component: Listen,
        children:  [
            {
                name: 'listen',
                path: '',
                props: true,
                component: TuneInfo
            },
            {
            name: 'listen pattern',
            props: ({params}) => ({...params, readonly: true }),
            path: ':patternName',
            component: PatternPlayer
        }]
    },
    {
        path: '/compose',
        component: Compose,
        children: [
            {
                name: 'compose',
                path: '',
                component: SongPlayer
            },
            {
                    name: 'edit pattern',
                    path: ':tuneName/:patternName',
                    props: ({params}) => ({...params, readonly: false }),
                    component: PatternPlayer
            }]
        }
  ]

  const router = new VueRouter({
    routes,
    mode: 'hash',
    scrollBehavior: () => ({ x: 0, y: 0 })
})

router.beforeEach((from, to, next) => { 
    stopAllPlayers()
    next()
})

export default router