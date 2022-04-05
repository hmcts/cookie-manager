export class EventProcessor {
     static handlerMap = new Map();

     static on (type, handler) {
         type = type.toLowerCase();
         if (!EventProcessor.handlerMap.has(type)) {
             EventProcessor.handlerMap.set(type, new Map());
         }

         const token = Math.random().toString(16).slice(2);
         EventProcessor.handlerMap.get(type).set(token, handler);

         return { type, token };
     }

     static off (eventToken) {
         let { type, token } = eventToken;
         type = type.toLowerCase();

         if (EventProcessor.handlerMap.has(type)) {
             EventProcessor.handlerMap.get(type).delete(token);
         }
     }

     static emit (type, data) {
         type = type.toLowerCase();
         console.debug('Event fired: ' + type);

         if (EventProcessor.handlerMap.has(type)) {
             EventProcessor.handlerMap.get(type).forEach(value => value(data));
         }
     }
}
