const {api, type, Extension}= require('clipcc-extension');

const VM= api.getVmInstance();
const stage_blocks= ()=> VM.runtime.targets[0].blocks._blocks;
const connectBlocksCacheName= 'ClipCCExtension.nhjr.connect_more_strings.connectBlocks.block';

var project_data= null;/*null初始化状态，true已加载缓存，object类型为待载入内容的对象*/
const MaxNum= 100;

var extension_loded= false;
var extension_loded_category= false;
var extension_loded_reporter= false;
var extension_error= '';
const connectBlocksCacheValueName_default= 'ClipCCExtension.nhjr.connect_more_strings.connectBlocks.value';
var connectBlocksCacheValueName= connectBlocksCacheValueName_default;
var connectBlocks= [];
const resetconnectBlocks= ()=>{
    connectBlocksCacheValueName= connectBlocksCacheValueName_default;
    connectBlocks= [];
}

function returnForMenu(MENU){
    if(MENU===undefined || MENU.length <1) return [['','']];
    return MENU
}


const add_returnBlock_block= num =>{
    var messageId= `connect ${num}[_0]`;
    var param= {
        _0: {
            type: type.ParameterType.STRING,
            default: '0'
        }
    };
    var fun= 'String(a._0)';
    for(var i=1; i<num; i++){
        messageId+= `[_${i}]`;
        param['_'+i] ={
            type: type.ParameterType.STRING,
            default: String(i)
        };
        fun+= '+a._'+i;
    }
    api.removeBlock('nhjr.connect_more_strings.returnBlock.'+num);
    api.addBlock({
        opcode: 'nhjr.connect_more_strings.returnBlock.'+num,
        type: type.BlockType.REPORTER,
        messageId: messageId,
        categoryId: 'nhjr.connect_more_strings.reporter',
        param: param,
        function: a=> eval(fun)
        /* 为什么不用
           delete a.mutation;
           Object.values(a).join('')
           因为这样的方法遇到对象会出问题，对象会排在字符串最后。*/
    });
}

const loadProjectCacheValue= sb =>{
    if(sb===undefined) return;
    console.log('loadProjectCacheValue');
    if(sb.hasOwnProperty(connectBlocksCacheName)){
        try{
            connectBlocksCacheValueName= sb[connectBlocksCacheName].inputs.NUM.block;
            connectBlocks= JSON.parse( sb[connectBlocksCacheValueName].fields.NUM.value );
            if(Array.isArray(connectBlocks)){
                for(const i in connectBlocks){
                    var num= Math.round(Number(connectBlocks[i]));
                    if(Number.isFinite(num) && num>=1 && num<=MaxNum) add_returnBlock_block(num);
                }
            }else{
                connectBlocks= [];
                console.error('loadProjectCacheValue error: not allowed type!')
            }
        }catch(e){
            console.error(e);
            connectBlocks= {};
        }
    }else resetconnectBlocks()
}

const str_connectBlocks= ()=> JSON.stringify(connectBlocks);

function loadCategory(){
    api.removeCategory('nhjr.connect_more_strings.category');
    api.addCategory({
        categoryId: 'nhjr.connect_more_strings.category', 
        messageId: 'nhjr.connect_more_strings.category',
        color: '#339900'
    });
    extension_loded_category= true
}
function loadReporter(){
    api.removeCategory('nhjr.connect_more_strings.reporter');
    api.addCategory({
        categoryId: 'nhjr.connect_more_strings.reporter', 
        messageId: 'nhjr.connect_more_strings.reporter',
        color: '#339900'
    });
    extension_loded_reporter= true
}
function removeCategorys(){
    api.removeCategory('nhjr.connect_more_strings.category');
    extension_loded_category= false;
    api.removeCategory('nhjr.connect_more_strings.reporter');
    extension_loded_reporter= false;
    extension_loded= false;
}

/*————————————————————————————————————————————————————————————————————*/

module.exports=class E extends Extension{

onUninit() {
    console.log('nhjr.connect_more_strings onUninit');
    removeCategorys()
}
logError(e) {
    console.error(e);
    extension_error= String(e);
    return extension_error;
}
inputStrToObj(Str) {
    if (typeof Str == 'object') return Str ;
    var i= ['undefined','NaN','Infinity','-Infinity'].indexOf(Str);
    if(i>-1) return [undefined,NaN,Infinity,-Infinity][i] ;
    return JSON.parse(Str)
}
connectBlocks_namesMenu(){
    var export_menu= {};
    for(const i in connectBlocks){
        var num= String(connectBlocks[i]);
        export_menu[num]= num;
    }
    return returnForMenu( Object.entries(export_menu) )
}


beforeProjectLoadExtension(data, extensions){
    try{
        console.log('nhjr.connect_more_strings beforeProjectLoadExtension');
        if(extension_loded){
            /*二次加载作品时，如果扩展已装载，就不会触发onInit。所以要在这里完成更新*/
            loadReporter();
            loadProjectCacheValue(data[0].blocks._blocks);
            project_data= true
        }else project_data= data
        /*onInit不支持data，所以需要从这里传入*/
    }catch(e){
        console.error(e);
        window.alert('nhjr.connect_more_strings beforeProjectLoadExtension error\n'+e)
    }
}
onInit() {
    try{
        console.log('nhjr.connect_more_strings onInit');
        loadCategory();
        loadReporter();
        if(project_data===true){
            /*项目缓存已经被加载，只需要按照connectBlocks里的装载即可。*/
            for(const name in connectBlocks){
                add_returnBlock_block(name);
            }
        }else if(project_data){
            /*如果此时正在加载项目文件，那么vm还不能用。所以需要data完成加载。*/
            loadProjectCacheValue( project_data[0].blocks._blocks );
            project_data= true
        }else if(project_data===null){
            /*此时变量仍是初始化状态，代表着并不是在项目加载时运行。因此vm可用。*/
            loadProjectCacheValue( stage_blocks() );
            project_data= true
        }else{
            /*目前没遇到过的情况。可能是data指定的对象不存在，也可能是其它程序的干扰。*/
            console.error("Can't load project_data: ");
            console.log(project_data)
        }
        this.onInit_addBlocks();
        extension_loded= true;
    }catch(e){
        console.error(e);
        window.alert('nhjr.connect_more_strings onInit error\n'+e)
    }
}

onInit_addBlocks(){
    let alerting = false;

    api.addBlock({
        opcode: 'nhjr.connect_more_strings.readme',
        type: type.BlockType.REPORTER,
        messageId: 'nhjr.connect_more_strings.readme',
        categoryId: 'nhjr.connect_more_strings.category',
        function: ()=> `language: zh-cn
该扩展会往项目文件里自动存入菜单信息，因此如果不是动态菜单，只需要一次性生成即可。
该扩展只会往背景的积木区域里存入菜单信息。

请不要连点 delete connect block 积木，这会使积木栏出现故障。

add connect block 仅允许填入 1~${MaxNum}（含头尾）的数。

扩展源码仓库
https://github.com/NanHaiJuRuo/clipcc-extension-connect_more_strings`
    });

    api.addBlock({
        opcode: 'nhjr.connect_more_strings.add_block',
        type: type.BlockType.COMMAND,
        messageId: 'nhjr.connect_more_strings.add_block',
        categoryId: 'nhjr.connect_more_strings.category',
        param: {
            NUM: {
                type: type.ParameterType.NUMBER,
                default: '3'
            }
        },
        function: a=>{
            try{
                const sb= stage_blocks();
                /*当舞台积木区没有缓存积木时，创建缓存积木*/
                if(!sb.hasOwnProperty(connectBlocksCacheName)){
                    sb[connectBlocksCacheValueName_default] ={
                        fields: {
                            NUM: {
                                id: undefined,
                                name: "NUM",
                                value: str_connectBlocks()
                            }
                        },
                        id: connectBlocksCacheValueName_default ,
                        inputs: {},
                        next: null,
                        opcode: "math_number",
                        parent: null,
                        shadow: true,
                        topLevel: false,
                        x: undefined,
                        y: undefined
                    };
                    sb[connectBlocksCacheName] ={
                        fields: {
                            OPERATOR: {
                                id: undefined,
                                name: "OPERATOR",
                                value: 'ClipCCExtension.nhjr.connect_more_strings.connectBlocks'
                            }
                        },
                        id: connectBlocksCacheName ,
                        inputs: {
                            NUM: {
                                block: connectBlocksCacheValueName_default,
                                name: "NUM",
                                shadow: connectBlocksCacheValueName_default
                            }
                        },
                        next: null,
                        opcode: "operator_mathop",
                        parent: null,
                        shadow: true,
                        topLevel: true,
                        x: "0",
                        y: "0"
                    };
                    connectBlocksCacheValueName= connectBlocksCacheValueName_default
                }
                /*开始缓存*/
                var num= Math.round(Number(a.NUM));
                if(!Number.isFinite(num) || num<1 || num>MaxNum || connectBlocks.includes(num)) return this.logError('nhjr.connect_more_strings.add_block error: not allowed type!');
                connectBlocks.push(num);
                const NUM= sb[connectBlocksCacheValueName].fields.NUM;
                var cache_str_connectBlocks = str_connectBlocks();
                if(NUM.value !== cache_str_connectBlocks) NUM.value= cache_str_connectBlocks;
                /*添加菜单使用积木*/
                add_returnBlock_block(num)
            }catch(e){return this.logError(e)}
        }
    });
    api.addBlock({
        opcode: 'nhjr.connect_more_strings.delete_block',
        type: type.BlockType.COMMAND,
        messageId: 'nhjr.connect_more_strings.delete_block',
        categoryId: 'nhjr.connect_more_strings.category',
        param: {
            NUM: {
                type: type.ParameterType.STRING,
                default: this.connectBlocks_namesMenu()[0][1],
                menu: ()=> this.connectBlocks_namesMenu()
            }
        },
        function: a=>{
            try{
                var num= Math.round(Number(a.NUM));
                if(!Number.isFinite(num) || num<1 || num>MaxNum) return this.logError('nhjr.connect_more_strings.add_block error: not allowed type!');
                const sb= stage_blocks();
                if(connectBlocks.includes(num)){
                    api.removeBlock('nhjr.connect_more_strings.returnBlock.'+num);
                    connectBlocks.splice( connectBlocks.indexOf(num) ,1)
                }
                if(sb.hasOwnProperty(connectBlocksCacheName)){
                    const NUM= sb[connectBlocksCacheValueName].fields.NUM;
                    var cache_str_connectBlocks = str_connectBlocks();
                    if(NUM.value !== cache_str_connectBlocks){
                        /*如果结果是空的，删除缓存积木，否则同步。*/
                        if(cache_str_connectBlocks ==='{}'){
                            delete sb[connectBlocksCacheName];
                            delete sb[connectBlocksCacheValueName];
                        }else NUM.value= cache_str_connectBlocks
                    }
                }
            }catch(e){return this.logError(e)}
        }
    });
    api.addBlock({
        opcode: 'nhjr.connect_more_strings.deleteAll_block',
        type: -1,
        messageId: 'nhjr.connect_more_strings.deleteAll_block',
        categoryId: 'nhjr.connect_more_strings.category',
        function: ()=> {
            const title= 'connect_more_strings';
            const message= 'Are you sure to delete all connectBlocks?\nThis operation cannot be undone!!!';
            const fun= ()=>{
                if (window.clipAlert) {
                    if (alerting) return;
                    return new Promise(resolve => {
                        alerting = true;
                        clipAlert(title, message)
                            .then(result => {
                                alerting = false;
                                resolve(result);
                            });
                    });
                }
                return confirm(message);
            };
            /* 以上代码借鉴自
            https://github.com/JasonXu134590/clipcc-extension-alert/blob/main/index.js#L40
            */
            if(fun()){
                connectBlocks= [];
                const sb= stage_blocks();
                delete sb[connectBlocksCacheName];
                delete sb[connectBlocksCacheValueName];
                loadReporter();
            }
        }
    });
    api.addBlock({
        opcode: 'nhjr.connect_more_strings.error',
        type: type.BlockType.REPORTER,
        messageId: 'nhjr.connect_more_strings.error',
        categoryId: 'nhjr.connect_more_strings.category',
        function: ()=> extension_error
    });
    api.addBlock({
        opcode: 'nhjr.connect_more_strings.connectBlocks_json',
        type: type.BlockType.REPORTER,
        messageId: 'nhjr.connect_more_strings.connectBlocks_json',
        categoryId: 'nhjr.connect_more_strings.category',
        function: ()=> str_connectBlocks()
    });
}

}