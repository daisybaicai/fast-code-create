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
    // VariableDeclaration(path) {
    //   const { node } = path;
    //   const { declarations } = node;

    //   node.declarations = declarations.filter((declaration) => {
    //     const { id } = declaration;
    //     if (t.isObjectPattern(id)) {
    //       // path.scope.getBinding(name).referenced 判断变量是否被引用
    //       // 通过filter移除掉没有使用的变量
    //       id.properties = id.properties.filter((property) => {
    //         const binding = path.scope.getBinding(property.key.name);
    //         // referenced 变量是否被引用
    //         // constantViolations 变量被重新定义的地方
    //         const { referenced, constantViolations } = binding;
    //         if (!referenced && constantViolations.length > 0) {
    //           constantViolations.map((violationPath) => {
    //             // 如果变量未使用过，被修改的语句也需要一起移除
    //             violationPath.remove();
    //           });
    //         }
    //         return referenced;
    //       });
    //       // 如果对象中所有变量都没有被应用，则该对象整个移除
    //       return id.properties.length > 0;
    //     } else {
    //       // const a = 1;
    //       const binding = path.scope.getBinding(id.name);
    //       const { referenced, constantViolations } = binding;
    //       if (!referenced && constantViolations.length > 0) {
    //         constantViolations.map((violationPath) => {
    //           violationPath.remove();
    //         });
    //       }
    //       return referenced;
    //     }
    //   });

    //   if (node.declarations.length === 0) {
    //     path.remove();
    //   }
    // },
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

