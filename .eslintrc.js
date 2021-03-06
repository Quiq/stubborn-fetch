module.exports = {
  parser: 'babel-eslint',
  rules: {
    /**
     * General Rules
     */
    // Errors
    'linebreak-style': [2, 'unix'],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'ForOfStatement',
        message:
          'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
      {
        selector: 'CallExpression[callee.name="xdescribe"]',
        message:
          '`xdescribe` is disallowed in the build. If this test suite really needs to be skipped, disable the `no-restricted-syntax` rule with a reason to ignore the test',
      },
      {
        selector: 'CallExpression[callee.name="xit"]',
        message:
          '`xit` is disallowed in the build. If this test really needs to be skipped, disable the `no-restricted-syntax` rule with a reason to ignore the test',
      },
      {
        selector: 'CallExpression[callee.name="fdescribe"]',
        message:
          'Focused specs are not allowed to be checked in because all the tests need to run in CI.',
      },
      {
        selector: 'CallExpression[callee.name="fit"]',
        message:
          'Focused specs are not allowed to be checked in because all the tests need to run in CI.',
      },
    ],

    // Warnings
    'prefer-destructuring': 1,
    'prefer-promise-reject-errors': 1,
    'no-else-return': 1,
    'dot-notation': 1,
    'prefer-template': 1,
    'object-shorthand': 1,
    'no-use-before-define': [1, {functions: false}],
    'no-param-reassign': 1,
    'no-shadow': 1,
    'prefer-rest-params': 1,
    'no-return-assign': 1,

    // Ignore
    semi: [0, 'always'],
    'no-plusplus': 0,
    'no-unused-expressions': 0,
    'no-continue': 0,
    'no-prototype-builtins': 0,
    'import/no-named-as-default': 0,
    'class-methods-use-this': 0, // Tells you to make everything static that doesn't reference `this`
    'prefer-arrow-callback': 0,
    'func-names': 0,
    'import/extensions': [0, 'always'],
    'import/first': 0,
    'import/no-extraneous-dependencies': 0, // Doesn't like our import structure
    'import/no-unresolved': 0, // Doesn't like our import structure
    'consistent-return': 0, // Flow knows what each method can return so we can handle all cases
    'no-underscore-dangle': 0,
    'wrap-iife': 0,
    'no-mixed-operators': 0,

    /**
     * Ignore style rules because of prettier
     */
    'space-infix-ops': 0,
    'array-bracket-spacing': 0,
    'block-spacing': 0,
    'brace-style': 0,
    camelcase: 0,
    'capitalized-comments': 0,
    'comma-spacing': 0,
    'comma-style': 0,
    'computed-property-spacing': 0,
    'consistent-this': 0,
    'eol-last': 0,
    'func-call-spacing': 0,
    'func-name-matching': 0,
    'func-names': 0,
    'func-style': 0,
    'function-paren-newline': 0,
    'id-blacklist': 'off',
    'id-length': 'off',
    'id-match': 'off',
    indent: 0,
    'key-spacing': 0,
    'keyword-spacing': 0,
    'line-comment-position': 0,
    'linebreak-style': 0,
    'lines-around-comment': 'off',
    'lines-around-directive': 0,
    'max-depth': 0,
    'max-len': 0,
    'max-lines': 0,
    'max-nested-callbacks': 'off',
    'max-params': ['off', 3],
    'max-statements': ['off', 10],
    'max-statements-per-line': ['off', {max: 1}],
    'multiline-ternary': ['off', 'never'],
    'new-cap': 0,
    'new-parens': 0,
    'newline-after-var': 'off',
    'newline-before-return': 'off',
    'newline-per-chained-call': 0,
    'no-array-constructor': 0,
    'no-bitwise': 0,
    'no-continue': 0,
    'no-confusing-arrow': 0, // Turning off because it fights with prettier sometimes
    'no-inline-comments': 'off',
    'no-lonely-if': 0,
    'no-mixed-operators': 0,
    'no-mixed-spaces-and-tabs': 0,
    'no-multi-assign': 0,
    'no-multiple-empty-lines': 0,
    'no-negated-condition': 'off',
    'no-nested-ternary': 0,
    'no-new-object': 'warn',
    'no-plusplus': 0,
    'no-spaced-func': 0,
    'no-tabs': 0,
    'no-ternary': 'off',
    'no-trailing-spaces': 0,
    'no-underscore-dangle': 0,
    'no-unneeded-ternary': 0,
    'no-whitespace-before-property': 0,
    'nonblock-statement-body-position': 'off',
    'object-curly-spacing': 0,
    'object-curly-newline': 0,
    'object-property-newline': 0,
    'one-var': 0,
    'one-var-declaration-per-line': 0,
    'operator-assignment': 0,
    'operator-linebreak': 'off',
    'padded-blocks': 0,
    'quote-props': 0,
    quotes: 0,
    'require-jsdoc': 'off',
    semi: 0,
    'semi-spacing': 0,
    'sort-keys': 0,
    'sort-vars': 'off',
    'space-before-blocks': 0,
    'space-before-function-paren': 0,
    'space-in-parens': 0,
    'space-infix-ops': 0,
    'space-unary-ops': 0,
    'spaced-comment': 0,
    'template-tag-spacing': ['off', 'never'],
    'unicode-bom': 0,
    'wrap-regex': 'off',
    'import/prefer-default-export': 0,
    'arrow-body-style': [0, 'as-needed'],
    curly: [0, 'multi-line'],
    'one-var-declaration-per-line': 0,
    'one-var': 0,
    'no-spaced-func': 0,
    'func-call-spacing': 0, // Dup
    'comma-dangle': [0, 'always-multiline'],
    'max-len': 0,
    'space-in-parens': [0, 'never'],
    'padded-blocks': [0, 'never'],
    'comma-spacing': 0,
    'no-multi-spaces': 0,
    'key-spacing': [0, {beforeColon: false, afterColon: true}],
    'object-property-newline': 0,
    'space-before-blocks': [0, 'always'],
    'arrow-spacing': 0,
    'keyword-spacing': 0,
    'quote-props': [0, 'as-needed'],
    'template-curly-spacing': [0, 'never'],
    'array-bracket-spacing': [0, 'never'],
    'object-curly-spacing': [0, 'never'],
    'space-before-function-paren': [0, 'always'],
    'brace-style': [0, 'stroustrup'],
    'arrow-parens': [0, 'as-needed'],
    'eol-last': 0,
    'default-case': 0,
    'block-spacing': 0,
    'no-lonely-if': 0,
  },
  extends: 'airbnb',

  env: {
    es6: true,
    browser: true,
    jasmine: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  plugins: ['flowtype'],
  globals: {
    TimeoutID: false,
    IntervalID: false,
    jest: false,
    T: false,
    $Subtype: false,
    $Enum: false,
  },
};
