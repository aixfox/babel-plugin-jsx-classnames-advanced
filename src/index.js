import { addDefault } from '@babel/helper-module-imports';

export const defaultOpts = {
  nameHint: '_babel_plugin_jsx_classnames_advanced',
  attributeNames: [
    'className',
    'dropdownClassName',
    'wrapperClassName',
    'wrapClassName',
    'overlayClassName',
  ],
  ignoreMemberExpression: true,
  ignoreIdentifier: true,
};

export default function ({ types: t }) {
  function replaceNode (path, callee) {
    path.node.value = t.JSXExpressionContainer(
      t.callExpression(
        callee,
        [path.node.value.expression],
      ),
    );
  }

  const visitor = {
    JSXAttribute(path, state) {
      const {
        attributeNames, nameHint, ignoreIdentifier, ignoreMemberExpression,
      } = { ...defaultOpts, ...state.opts };

      if (
        !attributeNames.some(i => t.isJSXIdentifier(path.node.name, { name: i })) ||
        !t.isJSXExpressionContainer(path.node.value) ||
        t.isStringLiteral(path.node.value.expression) ||
        (t.isMemberExpression(path.node.value.expression) && ignoreMemberExpression) ||
        (t.isIdentifier(path.node.value.expression) && ignoreIdentifier)
      ) return;

      if (nameHint === false) {
        replaceNode(path, addDefault(path, 'classnames', { nameHint: defaultOpts.nameHint }));
        return;
      }

      if (!state.isImported) {
        state.importedIndentifier = addDefault(path, 'classnames', { nameHint });

        replaceNode(path, state.importedIndentifier);

        state.isImported = 1;
      } else {
        replaceNode(path, t.identifier(state.importedIndentifier.name));
      }
    },
  };

  return {
    visitor,
  };
}
