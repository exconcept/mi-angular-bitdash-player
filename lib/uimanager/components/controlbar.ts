import {ContainerConfig, Container} from './container';
import {UIInstanceManager} from '../uimanager';
import {UIUtils} from '../uiutils';
import {Spacer} from './spacer';

/**
 * Configuration interface for the {@link ControlBar}.
 */
export interface ControlBarConfig extends ContainerConfig {
  // nothing yet
}

/**
 * A container for main player control components, e.g. play toggle button, seek bar, volume control, fullscreen toggle
 * button.
 */
export class ControlBar extends Container<ControlBarConfig> {

  constructor(config: ControlBarConfig, autoHide: boolean) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-controlbar',
      hidden: autoHide,
    }, <ControlBarConfig>this.config);
  }

  configure(player: bitmovin.PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let self = this;

    // Counts how many components are hovered and block hiding of the control bar
    let hoverStackCount = 0;

    // Track hover status of child components
    UIUtils.traverseTree(this, (component) => {
      // Do not track hover status of child containers or spacers, only of 'real' controls
      if (component instanceof Container || component instanceof Spacer) {
        return;
      }

      // Subscribe hover event and keep a count of the number of hovered children
      component.onHoverChanged.subscribe((sender, args) => {
        if (args.hovered) {
          hoverStackCount++;
        } else {
          hoverStackCount--;
        }
      });
    });

    uimanager.onControlsShow.subscribe(() => {
      if (self.config.hidden) {
        self.show();
      }
    });

    uimanager.onPreviewControlsHide.subscribe((sender, args) => {
      // Cancel the hide event if hovered child components block hiding
      args.cancel = (hoverStackCount > 0);
    });

    uimanager.onControlsHide.subscribe(() => {
      if (self.config.hidden) {
        self.hide();
      }
    });
  }
}
