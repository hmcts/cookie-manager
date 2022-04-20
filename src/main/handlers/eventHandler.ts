export class EventProcessor {
     static _handlerMap = new Map();

     /**
     * Adds a callback/event listener to the specified event, which will be called when the event occurs.
     *
     * @param {string} eventName - The event to listen for.
     * @param {Function} callback - The function to be called when the event is emitted.
     * @return {EventToken} - Object which acts as unique identifier for added listener,
     * to be passed to the `off` function to remove the added listener.
     */
     static on (eventName: string, callback: Function) {
         if (typeof eventName !== 'string') {
             console.error('Event not provided');
             return;
         }

         if (typeof callback !== 'function') {
             console.error('No callback function provided');
             return;
         }

         eventName = eventName.toLowerCase();
         const token = Math.random().toString(16).slice(2);

         if (!EventProcessor._handlerMap.has(eventName)) {
             EventProcessor._handlerMap.set(eventName, new Map());
         }

         EventProcessor._handlerMap.get(eventName).set(token, callback);
         return { type: eventName, token };
     }

     /**
     * Removes the listener identified by the eventToken parameter.
     *
     * @param {EventToken} eventToken - The EventToken of the callback/listener to remove.
     */
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
