import { EventProcessor } from '../../main/handlers/EventHandler';

describe('EventProcessor', () => {
    describe('emit', () => {
        beforeEach(() => {
            EventProcessor._handlerMap = new Map();
        });

        test('Should call single event listener', () => {
            const eventName = 'testEvent';
            const mockListenerFunction = jest.fn();

            const listenersMap = new Map();
            listenersMap.set('someRandomToken', mockListenerFunction);

            EventProcessor._handlerMap.set(eventName.toLowerCase(), listenersMap);
            EventProcessor.emit(eventName);
            expect(mockListenerFunction).toHaveBeenCalledTimes(1);
        });

        test('Should call multiple event listeners', () => {
            const eventName = 'testEvent';
            const mockListenerFunction = jest.fn();
            const mockListenerFunctionTwo = jest.fn();

            const listenersMap = new Map();
            listenersMap.set('someRandomToken', mockListenerFunction);
            listenersMap.set('someRandomTokenTwo', mockListenerFunctionTwo);

            EventProcessor._handlerMap.set(eventName.toLowerCase(), listenersMap);
            EventProcessor.emit(eventName);
            expect(mockListenerFunction).toHaveBeenCalledTimes(1);
            expect(mockListenerFunctionTwo).toHaveBeenCalledTimes(1);
        });

        test('Should only call event listeners for specified event', () => {
            const eventName = 'testEvent';
            const mockListenerFunction = jest.fn();
            const mockListenerFunctionTwo = jest.fn();

            const listenersMap = new Map();
            listenersMap.set('someRandomToken', mockListenerFunction);
            EventProcessor._handlerMap.set(eventName.toLowerCase(), listenersMap);

            const otherListenersMap = new Map();
            otherListenersMap.set('someRandomTokenTwo', mockListenerFunctionTwo);
            EventProcessor._handlerMap.set('otherevent', listenersMap);

            EventProcessor.emit(eventName);
            expect(mockListenerFunction).toHaveBeenCalledTimes(1);
            expect(mockListenerFunctionTwo).not.toHaveBeenCalled();
        });
    });

    describe('on', () => {
        beforeEach(() => {
            EventProcessor._handlerMap = new Map();
        });

        test('Should add new event listener map and event listener to event listener map ', () => {
            const eventName = 'testEvent';
            const listenerFunction = jest.fn();
            expect(EventProcessor._handlerMap.size).toBe(0);

            expect(EventProcessor.on(eventName, listenerFunction)).toStrictEqual(expect.any(Object));
            expect(EventProcessor._handlerMap.size).toBe(1);
            expect([...[...EventProcessor._handlerMap.values()][0].values()][0]).toBe(listenerFunction);
        });

        test('Should add new event listener to existing event listener map', () => {
            const eventName = 'testEvent';
            const listenersMap = new Map();
            listenersMap.set('someRandomToken', () => {});
            EventProcessor._handlerMap.set(eventName.toLowerCase(), listenersMap);

            const listenerFunction = jest.fn();

            expect(EventProcessor.on(eventName, listenerFunction)).toStrictEqual(expect.any(Object));
            expect(EventProcessor._handlerMap.size).toBe(1);
            expect([...[...EventProcessor._handlerMap.values()][0].values()][1]).toBe(listenerFunction);
        });

        test('Should add new event and return unique event token', () => {
            const eventName = 'testEvent';
            const listenerFunction = jest.fn();
            const expectedToken = {
                token: expect.anything(String),
                type: eventName.toLowerCase()
            };

            expect(EventProcessor.on(eventName, listenerFunction)).toStrictEqual(expectedToken);
            expect(EventProcessor._handlerMap.size).toBe(1);
            expect([...[...EventProcessor._handlerMap.values()][0].values()][0]).toBe(listenerFunction);
        });

        test('Should catch error when no token provided', () => {
            expect(() => { EventProcessor.on(); }).not.toThrow();
            expect(() => { EventProcessor.on({}); }).not.toThrow();
            expect(() => { EventProcessor.on('event', 'string'); }).not.toThrow();
        });
    });

    describe('off', () => {
        beforeEach(() => {
            EventProcessor._handlerMap = new Map();
        });

        test('Should remove new event listener from event listeners map ', () => {
            const eventName = 'testEvent';
            const eventId = 'randomEventId';
            const eventToken = {
                token: eventId,
                type: eventName.toLowerCase()
            };
            const listenersMap = new Map();
            const mockListenerFunction = jest.fn();
            listenersMap.set(eventId, mockListenerFunction);

            EventProcessor._handlerMap.set(eventName.toLowerCase(), listenersMap);
            expect([...[...EventProcessor._handlerMap.values()][0].values()][0]).toBe(mockListenerFunction);
            EventProcessor.off(eventToken);
            expect([...[...EventProcessor._handlerMap.values()][0].values()]).toStrictEqual([]);
        });

        test('Should catch error when no token provided', () => {
            expect(() => { EventProcessor.off(); }).not.toThrow();
            expect(() => { EventProcessor.off('malformedData'); }).not.toThrow();
        });
    });
});
