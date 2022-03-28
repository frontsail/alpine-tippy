import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export default function (Alpine) {
  Alpine.directive('tippy', (el, { modifiers, expression }, { effect, evaluateLater, cleanup }) => {
    const evaluator = evaluateLater(expression)
    let instance

    effect(() => {
      evaluator((evaluated) => {
        if (!evaluated && typeof evaluated !== 'number') {
          return instance && instance.destroy()
        }

        const contentOnly = typeof evaluated === 'string' || typeof evaluated === 'number'
        const props = contentOnly ? { content: evaluated.toString() } : evaluated

        // Filter HTML content with Underscored to prevent XSS attacks
        if ((props.allowHTML || (instance?.allowHTML && props.allowHTML === undefined)) && _D) {
          props.content = modifiers.includes('raw')
            ? props.content
            : _D.safe(props.content ?? instance.content)
        }

        if (instance && contentOnly) {
          instance.setContent(props.content)
        } else if (instance) {
          instance.clearDelayTimeouts()
          instance.setProps(props)
        } else {
          instance = tippy(el, props)
        }
      })
    })

    cleanup(() => {
      if (instance) {
        instance.destroy()
      }
    })
  })

  // Expose tippy so that `setDefaultProps()`
  // can be used from anywhere.
  if (!window.tippy) {
    window.tippy = tippy

    document.dispatchEvent(
      new CustomEvent('tippy:init', { bubbles: true, composed: true, cancelable: true }),
    )
  }
}
