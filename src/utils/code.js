import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as parser from '@babel/parser';
import generate from '@babel/generator';

/**
 * 移除未使用的变量
 * @param {*} str 
 * @returns 
 */
export const removeUnusedCode = (str) => {
  const ast = parser.parse(str.toString(),
  {
    sourceType: 'module',
    plugins: ['jsx'],
  },
  );

  traverse(ast, {
    // 处理 const var let
    VariableDeclaration(path) {
      const { node } = path;
      const { declarations } = node;

      node.declarations = declarations.filter((declaration) => {
        const { id } = declaration;
        if (t.isIdentifier(id)) {
          // 判断是否为指定变量名
          if (['ACTION', 'defaultOptions'].includes(id.name)) {
            // 查找变量绑定并判断是否被引用过
            const binding = path.scope.getBinding(id.name);
            // 只有有引用的会被保留
            return binding.referenced;
          }
        }
        return true; // 其他情况均保留声明
      });

      // 如果所有的声明都被移除了，则将当前节点从 AST 中删除
      if (node.declarations.length === 0) {
        path.remove();
      }
    },
    // 处理 import
    ImportDeclaration(path) {
      const { node } = path;
      const { specifiers } = node;
      if (!specifiers.length) {
        return;
      }
      node.specifiers = specifiers.filter((specifier) => {
        const { local } = specifier;
        const binding = path.scope.getBinding(local.name);
        return !!binding.referenced;
      });
      if (node.specifiers.length === 0) {
        path.remove();
      }
    },
    // 处理 function
    // FunctionDeclaration(path) {
    //   const { node } = path;
    //   const { id } = node;
    //   const binding = path.scope.getBinding(id.name);
    //   if (!binding?.referenced) {
    //     path.remove();
    //   }
    // },
  });
  const output = generate(ast, {
    retainLines: true,
  });
  return output.code;
};

