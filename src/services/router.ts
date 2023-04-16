import VueRouter, { RouteConfig } from 'vue-router'
import About from '../ui/overview/about'
import Listen from  '../ui/listen/listen'
import PatternPlayer from '../ui/pattern-player/pattern-player'
import TuneInfo from '../ui/tune-info/tune-info'
import Compose from '../ui/compose/compose'
import SongPlayer from '../ui/song-player/song-player'
import History from '../ui/history/history'
import { CreateElement } from 'vue'
import { StateProvider } from './history'
import { stopAllPlayers } from './player'

const routes : RouteConfig[] = [
    {
      path: '/',
      component: Listen, 
      children: [ {
        name: 'about',
        path: '',
        component: About
    }]
    },
    {
        path: '/listen',
        redirect: 'listen/General Breaks'
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
})

router.beforeEach((from, to, next) => { 
    stopAllPlayers()
    next()
})

export default router