import handleList from './list/index';
import handleForm from './form/index';
import handleDetail from './detail/index';
import handleAction from './action/index';
import handleDialog from './dialog';
import handleApi from './api/index';

const strategy = {
    "form": function(api,text, options) {
        // form 
        try{
            return handleForm(api,text, options);
        }catch(err){
            throw err
        }
    },
    "detail" : function(api,text, options) {
        try{
            return handleDetail(api,text, options);
        }catch(err){
            throw err
        }
    },
    "list" : function(api,text, options) {
        try{
            return handleList(api,text, options);
        }catch(err){
            throw err
        }
    },
    "api" : function(api,arr, options) {
        try{
            return handleApi(api,arr, options);
        }catch(err){
            throw err
        }
    },
    "action": function(api, text, options) {
        try{
            return handleAction(api, text, options);
        }catch(err){
            throw err
        }
    },
    "dialog": function(api, text, options) {
        try{
            return handleDialog(api, text, options);
        }catch(err){
            throw err
        }
    },
};

export default strategy;