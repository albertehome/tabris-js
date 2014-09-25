/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe( "Proxy", function() {

  var consoleBackup = window.console;
  var nativeBridge;
  var log;

  beforeEach( function() {
    window.console = jasmine.createSpyObj( "console", ["log", "info", "warn", "error"] );
    nativeBridge = new NativeBridgeSpy();
    log = [];
    tabris._reset();
    tabris._start( nativeBridge );
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  describe( "create", function() {

    var proxy;

    beforeEach( function() {
      proxy = new tabris.Proxy( "test-id" );
    });

    it( "creates proxy for standard types", function() {
      tabris.Proxy.create( "rwt.widgets.Button", { style: ["PUSH"], text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Button" );
      expect( create.properties ).toEqual( { style: ["PUSH"], text: "foo" } );
    } );

    it( "maps 'Button' to rwt.widgets.Button [PUSH]", function() {
      tabris.Proxy.create( "Button", { text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Button" );
      expect( create.properties ).toEqual( { style: ["PUSH"], text: "foo" } );
    } );

    it( "maps 'CheckBox' to rwt.widgets.Button [CHECK]", function() {
      tabris.Proxy.create( "CheckBox", { text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Button" );
      expect( create.properties ).toEqual( { style: ["CHECK"], text: "foo" } );
    } );

    it( "maps 'RadioButton' to rwt.widgets.Button [RADIO]", function() {
      tabris.Proxy.create( "RadioButton", { text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Button" );
      expect( create.properties ).toEqual( { style: ["RADIO"], text: "foo" } );
    } );

    it( "maps 'ToggleButton' to rwt.widgets.Button [TOGGLE]", function() {
      tabris.Proxy.create( "ToggleButton", { text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Button" );
      expect( create.properties ).toEqual( { style: ["TOGGLE"], text: "foo" } );
    } );

    it( "maps 'Text' to rwt.widgets.Text [BORDER]", function() {
      tabris.Proxy.create( "Text", { text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Text" );
      expect( create.properties ).toEqual( { style: ["BORDER"], text: "foo" } );
    } );

    it( "maps 'Text' with type 'password' to rwt.widgets.Text [PASSWORD]", function() {
      tabris.Proxy.create( "Text", { type: "password", text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Text" );
      expect( create.properties.style ).toEqual( ["BORDER", "PASSWORD"] );
    } );

    it( "maps 'Text' with type 'search' to rwt.widgets.Text [SEARCH]", function() {
      tabris.Proxy.create( "Text", { type: "search", text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Text" );
      expect( create.properties.style ).toEqual( ["BORDER", "SEARCH"] );
    } );

    it( "maps 'Text' with type 'multiline' to rwt.widgets.Text [MULTI]", function() {
      tabris.Proxy.create( "Text", { type: "multiline", text: "foo" } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.Text" );
      expect( create.properties.style ).toEqual( ["BORDER", "MULTI"] );
    } );

    it( "maps 'List' to rwt.widgets.Grid with a vertical Scollbar", function() {
      tabris.Proxy.create( "List", { linesVisible: true } );

      var createCalls = nativeBridge.calls({ op: "create" });
      expect( createCalls[0].type ).toEqual( "rwt.widgets.Grid" );
      expect( createCalls[0].properties ).toEqual( { style: [], linesVisible: true } );
      expect( createCalls[1].type ).toEqual( "rwt.widgets.ScrollBar" );
      expect( createCalls[1].properties ).toEqual( { style: ["VERTICAL"], parent: createCalls[0].id } );
    } );

    it( "maps 'ListItem' to rwt.widgets.GridItem", function() {
      tabris.Proxy.create( "ListItem", { texts: ["foo", "bar"] } );

      var create = nativeBridge.calls({ op: "create" })[0];
      expect( create.type ).toEqual( "rwt.widgets.GridItem" );
      expect( create.properties ).toEqual( { texts: ["foo", "bar"] } );
    } );

    it( "calls native create with type and properties", function() {
      proxy._create( "foo.bar", { foo: 23 } );

      var calls = nativeBridge.calls({ op: "create", type: "foo.bar" });
      expect( calls.length ).toBe( 1 );
      expect( calls[0].properties ).toEqual( { foo: 23 } );
    } );

    it( "translates properties", function() {
      var other = new tabris.Proxy( "other-id" );

      proxy._create( "custom.type", { foo: other } );

      var properties = nativeBridge.calls({ op: "create", type: "custom.type" })[0].properties;
      expect( properties.foo ).toBe( "other-id" );
    } );

    it( "translation does not modify properties", function() {
      var other = new tabris.Proxy( "other-id" );
      var properties = { foo: other };

      proxy._create( "custom.type", properties );

      expect( properties.foo ).toBe( other );
    } );

    it( "accepts rwt types without prefix", function() {
      proxy._create( "Label", {} );

      expect( nativeBridge.calls({ op: "create" })[0].type ).toEqual( "rwt.widgets.Label" );
    } );

    it( "accepts prefixed types", function() {
      proxy._create( "custom.Label", {} );

      expect( nativeBridge.calls({ op: "create" })[0].type ).toEqual( "custom.Label" );
    } );

  } );

  describe( "after creation", function() {

    var proxy;

    beforeEach( function() {
      proxy = new tabris.Proxy( "test-id" );
    });

    describe( "append", function() {

      it( "calls native create with parent", function() {
        proxy.append( "Label", {} );

        var createCall = nativeBridge.calls({ op: "create", type: "rwt.widgets.Label" })[0];
        expect( createCall.properties.parent ).toBe( proxy.id );
      } );

      it( "fails on disposed object", function() {
        proxy.dispose();

        expect( function() {
          proxy.append( "Label", {} );
        }).toThrowError( "Object is disposed" );
      } );

      it( "returns a proxy object with parent", function() {
        var child = proxy.append( "Label", {} );

        expect( child ).toEqual( jasmine.any( tabris.Proxy ) );
        expect( child._parent ).toBe( proxy );
      } );

    } );

    describe( "get", function() {

      it( "calls native get", function() {
        proxy.get( "foo" );

        expect( nativeBridge.calls({ op: "get", property: "foo" }).length ).toBe( 1 );
      } );

      it( "returns value from native", function() {
        spyOn( nativeBridge, "get" ).and.returnValue( 23 );

        var result = proxy.get( "prop" );

        expect( result ).toBe( 23 );
      } );

      it( "translates foreground to string", function() {
        spyOn( nativeBridge, "get" ).and.returnValue( [170, 255, 0, 128] );

        var result = proxy.get( "foreground" );

        expect( result ).toBe( "rgba(170, 255, 0, 0.5)" );
      } );

      it( "translates background to string", function() {
        spyOn( nativeBridge, "get" ).and.returnValue( [170, 255, 0, 128] );

        var result = proxy.get( "background" );

        expect( result ).toBe( "rgba(170, 255, 0, 0.5)" );
      } );

      it( "translates font to string", function() {
        spyOn( nativeBridge, "get" ).and.returnValue( [["Arial"], 12, true, true] );

        var result = proxy.get( "font" );

        expect( result ).toBe( "italic bold 12px Arial" );
      } );

      it( "fails on disposed object", function() {
        proxy.dispose();

        expect( function() {
          proxy.get( "foo" );
        }).toThrowError( "Object is disposed" );
      } );

    } );

    describe( "set", function() {

      it( "translates widgets to ids in properties", function() {
        var other = new tabris.Proxy( "other-id" );

        proxy.set( "foo", other );

        var call = nativeBridge.calls({ op: "set", id: proxy.id })[0];
        expect( call.properties.foo ).toBe( "other-id" );
      } );

      it( "does not translate objects with id field to ids", function() {
        var obj = { id: "23", name: "bar" };

        proxy.set( "foo", obj );

        var properties = nativeBridge.calls({ op: "set", id: proxy.id })[0].properties;
        expect( properties.foo ).toEqual( obj );
      } );

      it( "translation does not modify properties", function() {
        var other = new tabris.Proxy( "other-id" );
        var properties = { foo: other };

        proxy.set( properties );

        expect( properties.foo ).toBe( other );
      } );

      it( "raises a warning for incomplete horizontal layoutData", function() {
        proxy.set( "layoutData", {} );

        expect( console.warn )
          .toHaveBeenCalledWith( "Unsupported layoutData value: either left or right should be specified" );
      } );

      it( "raises a warning for incomplete vertical layoutData", function() {
        proxy.set( "layoutData", {left: 0} );

        expect( console.warn )
          .toHaveBeenCalledWith( "Unsupported layoutData value: either top or bottom should be specified" );
      } );

      it( "translates widgets to ids in layoutData", function() {
        var other = new tabris.Proxy( "other-id" );

        proxy.set( "layoutData", { left: 23, right: other, top: [other, 42] } );

        var call = nativeBridge.calls({ op: "set" })[0];
        expect( call.properties.layoutData ).toEqual( { left: 23, right: other.id, top: [other.id, 42] } );
      } );

      it( "translation does not modify layoutData", function() {
        var other = new tabris.Proxy( "other-id" );
        var layoutData = { left: 23, right: other, top: [other, 42] };

        proxy.set({ layoutData: layoutData });

        expect( layoutData.top ).toEqual( [other, 42] );
      } );

      it( "translates foreground and backgrund colors to arrays", function() {
        proxy.set({ foreground: "red", background: "rgba(1, 2, 3, 0.5)" });

        var call = nativeBridge.calls({ op: "set" })[0];
        expect( call.properties.foreground ).toEqual( [255, 0, 0, 255] );
        expect( call.properties.background ).toEqual( [1, 2, 3, 128] );
      } );

      it( "translates font string to array", function() {
        proxy.set({ font: "12px Arial" });

        var call = nativeBridge.calls({ op: "set" })[0];
        expect( call.properties.font ).toEqual([["Arial"], 12, false, false]);
      } );

      it( "translates colors in row templates", function() {
        var template = [{ left: 23, foreground: "red", background: "rgba(1, 2, 3, 0.5)" }];

        proxy.set( { rowTemplate: template } );

        var call = nativeBridge.calls({ op: "set" })[0];
        expect( call.properties.rowTemplate[0].foreground ).toEqual( [255, 0, 0, 255] );
        expect( call.properties.rowTemplate[0].background ).toEqual( [1, 2, 3, 128] );
      } );

      it( "does not modify row templates", function() {
        var template = [{ left: 23, foreground: "red" }];

        proxy.set( { rowTemplate: template } );

        expect( template ).toEqual( [{ left: 23, foreground: "red" }] );
      } );

      it( "skips properties that fail to encode", function() {
        proxy.set( { foo: 23, foreground: "unknown" } );

        var call = nativeBridge.calls({ op: "set" })[0];
        expect( call.properties ).toEqual( {foo: 23} );
      } );

      it( "issues warning for properties that fail to encode", function() {
        proxy.set( { foo: 23, foreground: "unknown" } );

        expect( window.console.warn )
          .toHaveBeenCalledWith( "Unsupported foreground value: invalid color: unknown" );
      } );

      it( "returns self to allow chaining", function() {
        var result = proxy.set( "foo", 23 );

        expect( result ).toBe( proxy );
      } );

      it( "fails on disposed object", function() {
        proxy.dispose();

        expect( function() {
          proxy.set( "foo", 23 );
        }).toThrowError( "Object is disposed" );
      } );

    } );

    describe( "call", function() {

      it( "calls native call", function() {
        proxy.call( "method", { foo: 23 } );

        var call = nativeBridge.calls()[0];
        expect( call.op ).toEqual( "call" );
        expect( call.method ).toEqual( "method" );
        expect( call.parameters ).toEqual( { foo: 23 } );
      } );

      it( "returns value from native", function() {
        spyOn( nativeBridge, "call" ).and.returnValue( 23 );

        var result = proxy.call( "method", {} );

        expect( result ).toBe( 23 );
      } );

      it( "fails on disposed object", function() {
        proxy.dispose();

        expect( function() {
          proxy.call( "foo", {} );
        }).toThrowError( "Object is disposed" );
      } );

    } );

    describe( "on", function() {

      var listener;

      beforeEach( function() {
        listener = jasmine.createSpy( "listener" );
        nativeBridge.resetCalls();
      } );

      it( "calls native listen (true) for first listener", function() {
        proxy.on( "foo", listener );

        var call = nativeBridge.calls({ op: "listen", event: "foo" })[0];
        expect( call.listen ).toEqual( true );
      } );

      it( "calls native listen for another listener for another event", function() {
        proxy.on( "foo", listener );
        proxy.on( "bar", listener );

        var call = nativeBridge.calls({ op: "listen", event: "bar" })[0];
        expect( call.listen ).toEqual( true );
      } );

      it( "does not call native listen for subsequent listeners for the same event", function() {
        proxy.on( "foo", listener );
        proxy.on( "foo", listener );

        expect( nativeBridge.calls({ op: "listen" }).length ).toBe( 1 );
      } );

      it( "returns self to allow chaining", function() {
        var result = proxy.on( "foo", listener );

        expect( result ).toBe( proxy );
      } );

      it( "fails on disposed object", function() {
        proxy.dispose();

        expect( function() {
          proxy.on( "foo", listener );
        }).toThrowError( "Object is disposed" );
      } );

    } );

    describe( "off", function() {

      var listener, listener2;

      beforeEach( function() {
        listener = jasmine.createSpy( "listener" );
        listener2 = jasmine.createSpy( "listener2" );
        proxy.on( "foo", listener );
        nativeBridge.resetCalls();
      } );

      it( "calls native listen (false) for last listener removed", function() {
        proxy.off( "foo", listener );

        var call = nativeBridge.calls({ op: "listen", event: "foo" })[0];
        expect( call.listen ).toBe( false );
      } );

      it( "does not call native listen when there are other listeners for the same event", function() {
        proxy.on( "foo", listener2 );
        proxy.off( "foo", listener );

        expect( nativeBridge.calls().length ).toBe( 0 );
      } );

      it( "returns self to allow chaining", function() {
        var result = proxy.off( "foo", listener );

        expect( result ).toBe( proxy );
      } );

      it( "fails on disposed object", function() {
        proxy.dispose();

        expect( function() {
          proxy.off( "foo", listener );
        }).toThrowError( "Object is disposed" );
      } );

    } );

    describe( "dispose", function() {

      it( "calls native destroy", function() {
        proxy.dispose();

        var destroyCall = nativeBridge.calls({ op: "destroy", id: proxy.id })[0];
        expect( destroyCall ).toBeDefined();
      } );

      it( "notifies dispose listeners", function() {
        var listener = jasmine.createSpy();
        proxy.on( "Dispose", listener );

        proxy.dispose();

        expect( listener ).toHaveBeenCalled();
        expect( listener.calls.first().args ).toEqual([ {} ]);
      } );

      it( "notifies all children's dispose listeners", function() {
        var child1 = tabris.create( "type", { parent: proxy } );
        var child2 = tabris.create( "type", { parent: proxy } );

        proxy.on( "Dispose", function() { log.push( "parent" ); } );
        child1.on( "Dispose", function() { log.push( "child1" ); } );
        child2.on( "Dispose", function() { log.push( "child2" ); } );

        proxy.dispose();

        expect( log ).toEqual( [ "child1", "child2", "parent" ] );
      } );

      it( "notifies children's dispose listeners recursively", function() {
        var parent = tabris.create( "type", {} );
        var child = tabris.create( "type", { parent: parent } );
        var grandchild = tabris.create( "type", { parent: child } );
        parent.on( "Dispose", function() { log.push( "parent" ); } );
        child.on( "Dispose", function() { log.push( "child" ); } );
        grandchild.on( "Dispose", function() { log.push( "grandchild" ); } );

        parent.dispose();

        expect( log ).toEqual( [ "grandchild", "child", "parent" ] );
      } );

      it( "does not call native destroy on children", function() {
        tabris.create( "type", { parent: proxy } );

        proxy.dispose();

        expect( nativeBridge.calls({ op: "destroy" }).length ).toBe( 1 );
      } );

      it( "does not call native destroy twice when called twice", function() {
        proxy.dispose();
        proxy.dispose();

        expect( nativeBridge.calls({ op: "destroy" }).length ).toBe( 1 );
      } );

      it( "unregisters from parent to allow garbage collection", function() {
        var child = tabris.create( "Label", { parent: proxy } );

        child.dispose();

        expect( proxy._children.length ).toBe( 0 );
      } );

    } );

  } );

} );
