// import handleList from './list/index';
// import handleForm from './form/index';
// import handleDetail from './detail/index';
// import handleAction from './action/index';
// import handleDialog from './dialog';
// import handleApi from './api/index';

const handleList = require('/list/index');

const strategy = {
    // "form": function(api,text, options) {
    //     // form 
    //     return handleForm(api,text, options);
    // },
    // "detail" : function(api,text, options) {
    //     return handleDetail(api,text, options);
    // },
    "list" : function(api,text, options) {
        console.log('haha12');
        return handleList(api,text, options);
    },
    // "api": function(api, text, options) {
    //     return handleApi(api, text, options);
    // },
    // "action": function(api, text, options) {
    //     return handleAction(api, text, options);
    // },
    // "dialog": function(api, text, options) {
    //     return handleDialog(api, text, options);
    // },
};

// export default strategy;

module.exports = strategy;