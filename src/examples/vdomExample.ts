import { createElement as h, VNode } from '../vdom/node'
import { patch } from '../vdom/render'

type Watcher<T> = (newVal: T, oldVal: T) => void
interface Cell<T> {
  val: () => T
  update: (fn: (currVal: T) => T) => void
  watch: (watcher: Watcher<T>) => void
}

const cell = <T>(initialValue: T): Cell<T> => {
  const watchers: Array<Watcher<T>> = []
  let currVal = initialValue

  return {
    val: () => currVal,
    update: fn => {
      const newVal = fn(currVal)
      if (newVal === currVal) return
      const oldVal = currVal
      currVal = newVal
      watchers.forEach(watcher => watcher(currVal, oldVal))
    },
    watch: watcher => watchers.push(watcher)
  }
}

// app
const data = cell({
  input: '',
  isFocused: false,
  list: ['First element', 'Second element']
})

const addItemToList = () => {
  if (data.val().input.trim().length === 0) return
  data.update(data => ({
    ...data,
    input: '',
    list: [...data.list, data.input.trim()]
  }))
}

const renderInput = (): VNode =>
  h('input', {
    class: { input: true, focused: data.val().isFocused },
    attrs: {
      placeholder: 'start typing'
    },
    props: {
      value: data.val().input
    },
    on: {
      input: (e: Event): void => {
        data.update(data => ({
          ...data,
          input: ((e as InputEvent).target as any).value
        }))
      },
      keydown: (e: Event): void => {
        if ((e as KeyboardEvent).key === 'Enter') addItemToList()
      },
      focus: (): void => {
        data.update(data => ({
          ...data,
          isFocused: true
        }))
      },
      blur: (): void => {
        data.update(data => ({
          ...data,
          isFocused: false
        }))
      }
    }
  })

const render = () =>
  h(
    'div',
    {
      class: ['example', 'container'],
      style: {
        width: '50%',
        margin: 'auto'
      }
    },
    [
      h(
        'h1',
        { style: { fontSize: '2em', fontWeight: 'bold' } },
        'Add items to list'
      ),
      h(
        'ul',
        { class: 'list', attrs: { style: 'width: 50%;' } },
        data.val().list.map(str => h('li', str))
      ),
      h('div', { class: 'newItem', style: { display: 'flex' } }, [
        renderInput(),
        h(
          'button',
          {
            class: { awesome: true },
            style: {
              backgroundColor: 'lightsalmon',
              color: 'darkred'
            },
            on: {
              click: addItemToList
            }
          },
          'Add'
        )
      ])
    ]
  )

const run = (): void => {
  const app = document.getElementById('app')
  if (app == null) throw new Error('No app container found.')

  let vdom = render()
  patch(app, vdom)
  data.watch(() => {
    vdom = patch(vdom, render())
  })
}
export { run }
