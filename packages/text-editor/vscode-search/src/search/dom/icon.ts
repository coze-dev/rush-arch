//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import createEle from 'crelt';

interface IconProps extends Record<string, unknown> {
  checked?: boolean;
  checkable?: boolean;
  onchange?: () => void;
  disabled?: boolean;
}

abstract class Icon {
  readonly dom: HTMLElement;
  public _checked?: boolean;
  private _disabled?: boolean;
  private checkable?: boolean;

  constructor(attr: IconProps = {}) {
    const { onchange, checked, checkable = true, disabled, ...rest } = attr;

    this.checkable = checkable;
    this._checked = checked || false;
    this._disabled = disabled || false;

    this.dom = createEle(
      'button',
      {
        class: this._checked
          ? 'cm-custom-search-panel-icon cm-custom-search-panel-icon-active'
          : 'cm-custom-search-panel-icon',
        type: 'button',
        onclick: () => {
          this.checked = !this.checked;
          onchange?.();
        },
        ...rest,
      },
      [this.getSVG()],
    );
  }

  abstract getSVG(): HTMLSpanElement;

  get checked() {
    return this._checked;
  }

  set checked(checked) {
    if (this.checkable) {
      if (checked) {
        if (
          !this.dom.classList.contains('cm-custom-search-panel-icon-active')
        ) {
          this.dom.classList.add('cm-custom-search-panel-icon-active');
        }
      } else {
        this.dom.classList.remove('cm-custom-search-panel-icon-active');
      }
    }

    this._checked = checked;
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(disabled) {
    if (disabled) {
      if (
        !this.dom.classList.contains('cm-custom-search-panel-icon-disabled')
      ) {
        this.dom.classList.add('cm-custom-search-panel-icon-disabled');
      }
    } else {
      this.dom.classList.remove('cm-custom-search-panel-icon-disabled');
    }

    this._disabled = disabled;
  }
}

export class IconCaseSensitive extends Icon {
  constructor(attr: IconProps = {}) {
    super(attr);
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML = `<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable="false"
            aria-hidden="true"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.91798 4.01101C8.70936 3.40601 8.13988 3 7.49992 3C6.85996 3 6.29048 3.40601 6.08186 4.01101L1.08186 18.511C0.811801 19.2942 1.22776 20.148 2.01093 20.4181C2.79411 20.6881 3.64792 20.2722 3.91798 19.489L4.94866 16.5H10.0512L11.0819 19.489C11.3519 20.2722 12.2057 20.6881 12.9889 20.4181C13.7721 20.148 14.188 19.2942 13.918 18.511L8.91798 4.01101ZM9.01669 13.5H5.98315L7.49992 9.10136L9.01669 13.5ZM15.9999 14.5C15.9999 12.4705 17.2243 11.5 17.9999 11.5C18.7755 11.5 19.9999 12.4705 19.9999 14.5C19.9999 16.5295 18.7755 17.5 17.9999 17.5C17.2243 17.5 15.9999 16.5295 15.9999 14.5ZM17.9999 8.5C18.8536 8.5 19.6173 8.73345 20.2754 9.13338C20.5471 8.75013 20.9943 8.5 21.4999 8.5C22.3283 8.5 22.9999 9.17157 22.9999 10V19C22.9999 19.8284 22.3283 20.5 21.4999 20.5C20.9943 20.5 20.5471 20.2499 20.2754 19.8666C19.6173 20.2665 18.8536 20.5 17.9999 20.5C14.9095 20.5 12.9999 17.441 12.9999 14.5C12.9999 11.559 14.9095 8.5 17.9999 8.5Z"
                fill="currentColor"
            />
        </svg>`;

    return span;
  }
}

export class IconRegExp extends Icon {
  constructor(attr: IconProps = {}) {
    super(attr);
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML = `<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable=false
            aria-hidden=true
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.7519 1C17.5803 1 18.2519 1.67157 18.2519 2.5V5.19722L20.4198 3.75192C21.1091 3.2924 22.0404 3.47866 22.4999 4.16795C22.9595 4.85724 22.7732 5.78855 22.0839 6.24808L19.456 8L22.0839 9.75192C22.7732 10.2115 22.9595 11.1428 22.4999 11.8321C22.0404 12.5213 21.1091 12.7076 20.4198 12.2481L18.2519 10.8028V13.5C18.2519 14.3284 17.5803 15 16.7519 15C15.9234 15 15.2519 14.3284 15.2519 13.5V10.8028L13.0839 12.2481C12.3946 12.7076 11.4633 12.5213 11.0038 11.8321C10.5443 11.1428 10.7305 10.2115 11.4198 9.75192L14.0477 8L11.4198 6.24808C10.7305 5.78855 10.5443 4.85724 11.0038 4.16795C11.4633 3.47866 12.3946 3.2924 13.0839 3.75192L15.2519 5.19722V2.5C15.2519 1.67157 15.9234 1 16.7519 1Z"
                fill="currentColor"
            />
            <circle cx=6.5 cy=17.5 r=4.5 fill="currentColor" />
        </svg>`;

    return span;
  }
}

export class IconWholeWord extends Icon {
  constructor(attr: IconProps = {}) {
    super(attr);
  }
  getSVG() {
    const span = document.createElement('span');
    span.innerHTML = `<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable=false
            aria-hidden=true
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.49995 5C8.13071 5 8.69408 5.3946 8.90964 5.98739L12.9096 16.9874C13.1927 17.7659 12.7911 18.6266 12.0126 18.9097C11.234 19.1928 10.3734 18.7912 10.0903 18.0126L9.54022 16.5H5.45968L4.90964 18.0126C4.62653 18.7912 3.76588 19.1928 2.98733 18.9097C2.20878 18.6266 1.80715 17.7659 2.09026 16.9874L6.09026 5.98739C6.30582 5.3946 6.86919 5 7.49995 5ZM6.55059 13.5H8.44931L7.49995 10.8893L6.55059 13.5Z"
                fill="currentColor"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.99991 3C1.99991 2.44772 2.44762 2 2.99991 2H20.9999C21.5522 2 21.9999 2.44772 21.9999 3C21.9999 3.55228 21.5522 4 20.9999 4H2.99991C2.44762 4 1.99991 3.55228 1.99991 3Z"
                fill="currentColor"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.98731 21C1.98731 20.4477 2.43502 20 2.98731 20H20.9999C21.5522 20 21.9999 20.4477 21.9999 21C21.9999 21.5523 21.5522 22 20.9999 22H2.98731C2.43502 22 1.98731 21.5523 1.98731 21Z"
                fill="currentColor"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.4999 5C16.3283 5 16.9999 5.67157 16.9999 6.5V10C18.2261 10 19.4566 10.3372 20.4137 11.1053C21.4065 11.9022 21.9999 13.0847 21.9999 14.5C21.9999 15.9153 21.4065 17.0978 20.4137 17.8947C19.4566 18.6628 18.2261 19 16.9999 19L14.9999 19C14.4476 19 13.9999 18.5523 13.9999 18V6.5C13.9999 5.67157 14.6714 5 15.4999 5ZM16.9999 13V16C17.7067 16 18.2261 15.8036 18.5358 15.555C18.8098 15.3352 18.9999 15.0177 18.9999 14.5C18.9999 13.9823 18.8098 13.6648 18.5358 13.4449C18.2261 13.1963 17.7066 13 16.9999 13Z"
                fill="currentColor"
            />
        </svg>`;

    return span;
  }
}

export class IconArrowUp extends Icon {
  constructor(attr: IconProps = {}) {
    super({ ...attr, checkable: false });
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML = `<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable=false
            aria-hidden=true
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 23C11.1716 23 10.5 22.3284 10.5 21.5L10.5 6.12132L4.06066 12.5607C3.47487 13.1464 2.52513 13.1464 1.93934 12.5607C1.35355 11.9749 1.35355 11.0251 1.93934 10.4393L10.9393 1.43934C11.5251 0.853554 12.4749 0.853554 13.0607 1.43934L22.0607 10.4393C22.6464 11.0251 22.6464 11.9749 22.0607 12.5607C21.4749 13.1464 20.5251 13.1464 19.9393 12.5607L13.5 6.12132L13.5 21.5C13.5 22.3284 12.8284 23 12 23Z"
                fill="currentColor"
            />
        </svg>`;

    return span;
  }
}

export class IconArrowDown extends Icon {
  constructor(attr: IconProps = {}) {
    super({ ...attr, checkable: false });
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML = `<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable=false
            aria-hidden=true
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 1C12.8284 1 13.5 1.67157 13.5 2.5V17.8787L19.9393 11.4393C20.5251 10.8536 21.4749 10.8536 22.0607 11.4393C22.6464 12.0251 22.6464 12.9749 22.0607 13.5607L13.0607 22.5607C12.4749 23.1464 11.5251 23.1464 10.9393 22.5607L1.93934 13.5607C1.35355 12.9749 1.35355 12.0251 1.93934 11.4393C2.52513 10.8536 3.47487 10.8536 4.06066 11.4393L10.5 17.8787V2.5C10.5 1.67157 11.1716 1 12 1Z"
                fill="currentColor"
            />
        </svg>`;

    return span;
  }
}

export class IconReplace extends Icon {
  constructor(attr: IconProps = {}) {
    super({ ...attr, checkable: false });
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML =
      '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path d="M206.144 239.296l144.704 145.216L492.8 242.176l-44.8-44.8-64.768 64.448-0.512-102.4a33.472 33.472 0 0 1 32-33.664H512V64H414.72A94.848 94.848 0 0 0 320 159.296V262.4L251.328 194.112l-45.184 45.184z m426.88 114.816h0.64c11.712 19.904 28.864 29.888 51.584 29.888 25.152 0 45.184-10.752 60.16-32.192 15.104-21.44 22.592-49.92 22.592-85.312 0-32.704-6.4-58.432-19.264-77.248-12.864-18.88-31.232-28.288-55.04-28.288-25.92 0-45.952 12.416-60.032 37.184h-0.64V64H576v314.816h56.96v-24.704z m-0.96-67.904v-21.76c0-15.872 3.712-28.672 11.2-38.464a34.56 34.56 0 0 1 28.48-14.72 31.36 31.36 0 0 1 27.904 14.912c6.656 9.856 9.92 23.552 9.92 41.152 0 21.12-3.584 37.568-10.816 49.152a33.536 33.536 0 0 1-30.08 17.28 31.68 31.68 0 0 1-26.304-13.504 54.592 54.592 0 0 1-10.24-34.048zM576 817.216c-16.384 9.856-40 14.784-70.912 14.784-36.032 0-65.28-11.392-87.616-34.112-22.336-22.72-33.472-52.032-33.472-87.936 0-41.472 11.904-74.112 35.84-97.92 23.936-24.064 56-36.032 96-36.032 27.712 0 47.744 3.84 60.16 11.456v63.872a80.64 80.64 0 0 0-50.688-17.664c-20.8 0-37.312 6.4-49.536 19.072-12.16 12.544-18.112 29.952-18.112 52.224 0 21.632 5.76 38.592 17.408 51.008 11.648 12.224 27.584 18.368 47.936 18.368 18.048 0 35.712-5.888 52.992-17.664v60.544zM256 448L192 512v384l64 64h448l64-64V512l-64-64H256z m0 64h448v384H256V512z" fill="currentColor"></path></svg>';

    return span;
  }
}

export class IconReplaceAll extends Icon {
  constructor(attr: IconProps = {}) {
    super({ ...attr, checkable: false });
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML =
      '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path d="M742.4 171.328c9.408-19.84 22.784-29.76 40.064-29.76 15.872 0 28.16 7.552 36.672 22.592 8.576 15.104 12.864 35.648 12.864 61.824 0 28.352-4.992 51.072-15.04 68.288-9.984 17.152-23.36 25.728-40.128 25.728-15.168 0-26.624-8-34.368-23.936h-0.512v19.84H704V64h37.952v107.328h0.512z m-1.024 70.4a49.92 49.92 0 0 0 6.848 27.264c4.544 7.232 10.432 10.816 17.536 10.816 8.704 0 15.36-4.608 20.096-13.824 4.8-9.28 7.232-22.4 7.232-39.36 0-14.08-2.24-24.96-6.656-32.896-4.288-7.936-10.496-11.968-18.56-11.968-7.68 0-14.016 3.968-19.008 11.84a56.704 56.704 0 0 0-7.488 30.72v17.408zM263.68 492.48L128 356.352l42.368-42.368 64.384 64v-96.64A88.96 88.96 0 0 1 323.52 192H473.6v57.92H323.52a31.36 31.36 0 0 0-29.952 31.552l0.448 96 60.736-60.416 41.984 41.984-133.12 133.44zM598.784 315.52H640V206.08C640 154.112 619.84 128 579.584 128c-8.64 0-18.24 1.536-28.8 4.672a92.416 92.416 0 0 0-24.832 10.688v42.56c15.168-12.992 31.168-19.456 48-19.456 16.704 0 25.088 9.984 25.088 30.016l-38.4 6.592c-32.384 5.504-48.64 25.984-48.64 61.504 0 16.832 3.904 30.272 11.712 40.384A39.04 39.04 0 0 0 556.16 320c18.56 0 32.576-10.24 42.048-30.72h0.576v26.24z m0.256-86.72v12.352c0 11.2-2.56 20.48-7.68 27.904a23.552 23.552 0 0 1-20.032 10.88 17.664 17.664 0 0 1-14.08-6.08 24.32 24.32 0 0 1-5.12-15.872c0-14.208 7.04-22.464 21.248-24.896l25.6-4.288zM448 827.52h-41.216v-26.24h-0.576c-9.472 20.48-23.488 30.72-42.048 30.72a39.04 39.04 0 0 1-32.448-15.04c-7.808-10.112-11.712-23.552-11.712-40.32 0-35.584 16.256-56.064 48.64-61.568l38.4-6.592c0-20.032-8.32-30.08-25.088-30.08-16.832 0-32.832 6.528-48 19.52v-42.56c6.08-4.032 14.336-7.616 24.832-10.688 10.56-3.136 20.16-4.672 28.8-4.672 40.32 0 60.416 26.048 60.416 78.08v109.44z m-40.96-74.368v-12.352l-25.6 4.352c-14.208 2.368-21.312 10.624-21.312 24.832 0 6.4 1.728 11.712 5.12 15.872a17.664 17.664 0 0 0 14.08 6.08 23.552 23.552 0 0 0 19.968-10.88c5.12-7.424 7.68-16.64 7.68-27.904zM592.768 832c20.544 0 36.352-3.712 47.232-11.072v-45.44a57.6 57.6 0 0 1-35.328 13.248 39.616 39.616 0 0 1-32-13.76c-7.68-9.28-11.584-22.08-11.584-38.272 0-16.64 4.032-29.696 12.096-39.168a41.216 41.216 0 0 1 33.024-14.272c12.416 0 23.68 4.416 33.792 13.248v-47.936c-8.256-5.76-21.632-8.576-40.064-8.576-26.688 0-48.064 8.96-64.064 27.008-15.936 17.92-23.872 42.368-23.872 73.472 0 26.88 7.424 48.896 22.336 65.92 14.848 17.088 34.368 25.6 58.432 25.6zM128 576l64-64h576l64 64v320l-64 64H192l-64-64V576z m64 0v320h576V576H192z m192-128l64-64h448l64 64v320l-64 64V448H384z" fill="currentColor"></path></svg>';

    return span;
  }
}

export class IconClose extends Icon {
  constructor(attr: IconProps = {}) {
    super({ ...attr, checkable: false });
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML = `<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable=false
            aria-hidden=true
        >
            <path
                d="M17.6568 19.7782C18.2426 20.3639 19.1924 20.3639 19.7782 19.7782C20.3639 19.1924 20.3639 18.2426 19.7782 17.6568L14.1213 12L19.7782 6.34313C20.3639 5.75734 20.3639 4.8076 19.7782 4.22181C19.1924 3.63602 18.2426 3.63602 17.6568 4.22181L12 9.87866L6.34313 4.22181C5.75734 3.63602 4.8076 3.63602 4.22181 4.22181C3.63602 4.8076 3.63602 5.75734 4.22181 6.34313L9.87866 12L4.22181 17.6568C3.63602 18.2426 3.63602 19.1924 4.22181 19.7782C4.8076 20.3639 5.75734 20.3639 6.34313 19.7782L12 14.1213L17.6568 19.7782Z"
                fill="currentColor"
            />
        </svg>`;

    return span;
  }
}

export class IconEnter extends Icon {
  constructor(attr: IconProps = {}) {
    super({ ...attr, checkable: false });
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML =
      '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path d="M896 277.333333a21.333333 21.333333 0 0 0-21.333333-21.333333h-42.666667a21.333333 21.333333 0 0 0-21.333333 21.333333V469.333333H270.08l146.773333-146.773333a20.906667 20.906667 0 0 0 0-29.866667l-30.293333-30.293333a21.333333 21.333333 0 0 0-30.293333 0l-218.88 218.88a32.853333 32.853333 0 0 0-9.386667 22.613333v16.213334a32 32 0 0 0 9.386667 22.613333l219.306666 218.88a21.333333 21.333333 0 0 0 30.293334 0l30.293333-29.866667a21.333333 21.333333 0 0 0 0-30.293333L270.08 554.666667H810.666667a85.333333 85.333333 0 0 0 85.333333-85.333334zM227.413333 512z" fill="currentColor" ></path></svg>';

    return span;
  }
}

export class IconChevronRight extends Icon {
  constructor(attr: IconProps = {}) {
    super({ ...attr });
  }

  getSVG() {
    const span = document.createElement('span');
    span.innerHTML = `<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable=false
            aria-hidden=true
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.43934 19.7957C6.85355 19.2099 6.85355 18.2601 7.43934 17.6744L13.0962 12.0175L7.43934 6.36065C6.85355 5.77486 6.85355 4.82511 7.43934 4.23933C8.02513 3.65354 8.97487 3.65354 9.56066 4.23933L16.2782 10.9568C16.864 11.5426 16.864 12.4924 16.2782 13.0782L9.56066 19.7957C8.97487 20.3815 8.02513 20.3815 7.43934 19.7957Z"
                fill="currentColor"
            />
        </svg>`;

    return span;
  }
}
