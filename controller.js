const Message = require('./models.js');

function sortFunc(a, b){
    if(a.date < b.date) return 1
    return -1
}

async function dispatch(data, ws, online){
    switch(data.type){
        case 'nickname':{
            if(!online.find(i=>i.ws===ws)){
                online.push({ nickname: data.nickname, ws });
            }
            const sentMsgs = await Message.find({src: data.nickname});
            const recvedMsgs = await Message.find({dst: data.nickname});
            const msgs = [...sentMsgs, ...recvedMsgs].map(i=>({
                id: i.id,
                src: i.src,
                dst: i.dst,
                theme: i.theme,
                msg: i.msg,
                date: i.date
            }));
            msgs.sort(sortFunc);
            const unique = [];
            const messages = msgs.filter(i=>{
                if(unique.includes(i.id)) return false;
                unique.push(i.id);
                return true
            })
            let resp = { messages, type: 'all-messages' };
            ws.send(JSON.stringify(resp));
            return
        }
        case 'new-message':{
            const msg = {
                src: data.src,
                dst: data.dst,
                theme: data.theme,
                msg: data.msg,
                date: new Date,
            };
            const newMsg = await Message.create(msg);
            newMsg.save();
            const newMessage = {
                id: newMsg.id,
                src: newMsg.src,
                dst: newMsg.dst,
                theme: newMsg.theme,
                msg: newMsg.msg,
                date: newMsg.date
            }
            const resp = JSON.stringify({
                type: 'new-message', 
                newMessage,
            });
            ws.send(resp);
            const user = online.find(i=>i.nickname===data.dst);
            if(user && data.dst!==data.src){
                console.log(online)
               user.ws.send(resp);
            }
            return
        }
        case 'logout':{
            const i = online.findIndex(i=>i.ws===ws)
            if (i!==-1){
                online.splice(i, 1);
            }
            return
        }
        case 'get-sug-nicknames':{
            const srcs = await Message.find({src: new RegExp('^'+data.contain)})
            const dsts = await Message.find({dst: new RegExp('^'+data.contain)})
            const uniqs = [];
            srcs.forEach(i=>{
                if(!uniqs.includes(i.src)) uniqs.push(i.src);
            })
            dsts.forEach(i=>{
                if(!uniqs.includes(i.dst)) uniqs.push(i.dst);
            })
            const resp = JSON.stringify({
                type: 'sug-nicknames',
                sugNicknames: uniqs,
            })
            ws.send(resp);
            return
        }
        
    }
}

module.exports = dispatch;