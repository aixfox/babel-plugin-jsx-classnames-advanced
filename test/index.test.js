import { transformSync } from '@babel/core';
import pluginJsxClassnames, { defaultOpts } from '../src';

const { nameHint } = defaultOpts;

function transformWithPlugin(str, opt = {}) {
  const { code } = transformSync(
    str,
    {
      plugins: [
        '@babel/plugin-syntax-jsx',
        'transform-remove-strict-mode',
        [pluginJsxClassnames, opt],
      ],
    },
  );

  return code;
}


describe('ignore', () => {
  it('ignore other attribute name', () => {
    expect(
      transformWithPlugin(
        `<div otherAttributeName={[]} />`,
      ),
    ).toEqual(
      `<div otherAttributeName={[]} />;`,
    );
  });

  it('ignore origin syntax string literal', () => {
    expect(
      transformWithPlugin(
        `<div className="a" />`,
      ),
    ).toEqual(
      `<div className="a" />;`,
    );
  });

  it('ignore expression string literal', () => {
    expect(
      transformWithPlugin(
        `<div className={'a'} />`,
      ),
    ).toEqual(
      `<div className={'a'} />;`,
    );
  });

  it('ignore expression member', () => {
    expect(
      transformWithPlugin(
        `<div className={styles.wrap} />`,
      ),
    ).toEqual(
      `<div className={styles.wrap} />;`,
    );
  });

  it('ignore expression identifier', () => {
    expect(
      transformWithPlugin(
        `<div className={a} />`,
      ),
    ).toEqual(
      `<div className={a} />;`,
    );
  });
});

describe('transform expression', () => {
  it('transform expression array', () => {
    expect(
      transformWithPlugin(
        `<div className={[]} />`,
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div className={${nameHint}([])} />;`,
    );
  });

  it('transform expression object', () => {
    expect(
      transformWithPlugin(
        `<div className={{}} />`,
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div className={${nameHint}({})} />;`,
    );
  });

  it('transform expression other', () => {
    expect(
      transformWithPlugin(
        `<div className={'a' + 'b'} />`,
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div className={${nameHint}('a' + 'b')} />;`,
    );
  });
});

describe('attribute name', () => {
  it('transform with default option dropdownClassName', () => {
    expect(
      transformWithPlugin(
        `<div dropdownClassName={[]} />`,
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div dropdownClassName={${nameHint}([])} />;`,
    );
  });

  it('transform with default option wrapperClassName', () => {
    expect(
      transformWithPlugin(
        `<div wrapperClassName={[]} />`,
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div wrapperClassName={${nameHint}([])} />;`,
    );
  });

  it('transform with default option wrapClassName', () => {
    expect(
      transformWithPlugin(
        `<div wrapClassName={[]} />`,
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div wrapClassName={${nameHint}([])} />;`,
    );
  });

  it('transform with default option overlayClassName', () => {
    expect(
      transformWithPlugin(
        `<div overlayClassName={[]} />`,
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div overlayClassName={${nameHint}([])} />;`,
    );
  });
});

describe('option', () => {
  it('transform with option attributeNames', () => {
    expect(
      transformWithPlugin(
        `<div attributeName0={[]} />`,
        { attributeNames: ['attributeName0'] },
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div attributeName0={${nameHint}([])} />;`,
    );
  });

  it('transform with option nameHint: \'nameHint\'', () => {
    expect(
      transformWithPlugin(
        `<div className={[]} />`,
        { nameHint: 'nameHint' },
      ),
    ).toEqual(
      `import _nameHint from "classnames";\n<div className={_nameHint([])} />;`,
    );
  });

  it('transform with option nameHint: \'_nameHint\' (underscore)', () => {
    expect(
      transformWithPlugin(
        `<div className={[]} />`,
        { nameHint: '_nameHint' },
      ),
    ).toEqual(
      `import _nameHint from "classnames";\n<div className={_nameHint([])} />;`,
    );
  });

  it('transform with option nameHint: false', () => {
    expect(
      transformWithPlugin(
        `<><div className={[]} /><div className={[]} /></>`,
        { nameHint: false },
      ),
    ).toEqual(
      `import ${nameHint}2 from "classnames";\nimport ${nameHint} from "classnames";\n<><div className={${nameHint}([])} /><div className={${nameHint}2([])} /></>;`,
    );
  });

  it('transform with option ignoreMemberExpression: false', () => {
    expect(
      transformWithPlugin(
        `<div className={styles.wrap} />`,
        { ignoreMemberExpression: false },
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div className={${nameHint}(styles.wrap)} />;`,
    );
  });

  it('transform with option ignoreMemberExpression: false, other expected expressions', () => {
    expect(
      transformWithPlugin(
        `<div className={[]} />`,
        { ignoreMemberExpression: false },
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div className={${nameHint}([])} />;`,
    );
  });

  it('transform with option ignoreIdentifier: false', () => {
    expect(
      transformWithPlugin(
        `<div className={a} />`,
        { ignoreIdentifier: false },
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div className={${nameHint}(a)} />;`,
    );
  });

  it('transform with option ignoreIdentifier: false, other expected expressions', () => {
    expect(
      transformWithPlugin(
        `<div className={[]} />`,
        { ignoreIdentifier: false },
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<div className={${nameHint}([])} />;`,
    );
  });
});

describe('uniq', () => {
  it('avoid duplicate imports', () => {
    expect(
      transformWithPlugin(
        `<><div className={[]} /><div className={[]} /></>`,
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<><div className={${nameHint}([])} /><div className={${nameHint}([])} /></>;`,
    );
  });
});

describe('misc', () => {
  it('misc 0', () => {
    expect(
      transformWithPlugin(
        `<><div className={styles.wrap} /><div className={[]} /><div className={{}} /><div attributeName0={{}} /></>`,
        { attributeNames: ['className', 'attributeName0'], nameHint: '_nameHint' },
      ),
    ).toEqual(
      `import _nameHint from "classnames";\n<><div className={styles.wrap} /><div className={_nameHint([])} /><div className={_nameHint({})} /><div attributeName0={_nameHint({})} /></>;`,
    );
  });

  it('misc 1', () => {
    expect(
      transformWithPlugin(
        `<><div className={styles.wrap} /><div className={[]} /><div className={{}} /><div attributeName0={{}} /></>`,
        { ignoreMemberExpression: false },
      ),
    ).toEqual(
      `import ${nameHint} from "classnames";\n<><div className={${nameHint}(styles.wrap)} /><div className={${nameHint}([])} /><div className={${nameHint}({})} /><div attributeName0={{}} /></>;`,
    );
  });
});
