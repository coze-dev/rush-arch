import { type Tooltip, showTooltip } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';

interface FloatingViewProvider {
  provide: () => Tooltip;
}

const addPositionViewProvider = StateEffect.define<FloatingViewProvider>();
const removePositionViewProvider = StateEffect.define<FloatingViewProvider>();
const updatePositionViews = StateEffect.define();

const positionViewProvidersState = StateField.define<FloatingViewProvider[]>({
  create() {
    return [];
  },
  update(providers, tr) {
    for (const effect of tr.effects) {
      if (effect.is(addPositionViewProvider)) {
        providers = [...providers, effect.value];
      }

      if (effect.is(removePositionViewProvider)) {
        const index = providers.indexOf(effect.value);
        providers = providers.slice().splice(index, 1);
      }
    }

    return providers;
  },
});

const positionViewTooltipsState = StateField.define<Tooltip[]>({
  create() {
    return [];
  },
  update(value, tr) {
    if (tr.effects.some(effect => effect.is(updatePositionViews))) {
      const providers = tr.state.field(positionViewProvidersState);

      if (Array.isArray(providers)) {
        return providers.map(provider => provider.provide()).filter(Boolean);
      }
    }

    return value;
  },
  provide(f) {
    return showTooltip.computeN([f], state => state.field(f));
  },
});

export {
  positionViewProvidersState,
  positionViewTooltipsState,
  updatePositionViews,
  addPositionViewProvider,
  removePositionViewProvider,
};
