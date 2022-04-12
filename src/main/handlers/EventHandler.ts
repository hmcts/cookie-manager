export class EventProcessor {
     static _handlerMap = new Map();

     static on (eventName: string, handler: Function) {
         if (typeof eventName !== 'string') {
             console.error('Event not provided');
             return;
         }

         if (typeof handler !== 'function') {
             console.error('No callback function provided');
             return;
         }

         eventName = eventName.toLowerCase();
         const token = Math.random().toString(16).slice(2);

         if (!EventProcessor._handlerMap.has(eventName)) {
             EventProcessor._handlerMap.set(eventName, new Map());
         }

         EventProcessor._handlerMap.get(eventName).set(token, handler);
         return { type: eventName, token };
     }

     static off (eventToken) {
         let type;
         let token;

         try {
             type = eventToken.type.toLowerCase();
             token = eventToken.token;
         } catch (e) {
             console.error('Missing or malformed event token provided');
             return;
         }

         if (EventProcessor._handlerMap.has(type)) {
             EventProcessor._handlerMap.get(type).delete(token);
         }
     }

     static emit (type: string, data?: any) {
         type = type.toLowerCase();
         console.debug('Event fired: ' + type);

         if (EventProcessor._handlerMap.has(type)) {
             EventProcessor._handlerMap.get(type).forEach(value => value(data));
         }
     }
}
