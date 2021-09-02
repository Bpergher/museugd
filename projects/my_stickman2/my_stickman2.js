"use strict"

// register the application module
b4w.register("my_stickman2_main", function(exports, require) {

// import modules used by the app
var m_app       = require("app");
var m_cfg       = require("config");
var m_data      = require("data");
var m_preloader = require("preloader");
var m_ver       = require("version");
var m_anim  = require("animation");
var m_ctl   = require("controls");
var m_phy   = require("physics");
var m_cons  = require("constraints");
var m_scs   = require("scenes");
var m_trans = require("transform");
var m_cfg   = require("config");

var _character;
var _character_rig;

var ROT_SPEED = 1.5;
var CAMERA_OFFSET = new Float32Array([0, 4, 1.5]);
    
// detect application mode
var DEBUG = (m_ver.type() == "DEBUG");

// automatically detect assets path
var APP_ASSETS_PATH = m_cfg.get_assets_path("my_stickman2");

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        show_fps: DEBUG,
        console_verbose: DEBUG,
        autoresize: true
    });
}

/**
 * callback executed when the app is initialized 
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    //m_preloader.create_preloader();

    // ignore right-click on the canvas element
    canvas_elem.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    load();
}

/**
 * load the scene data
 */
function load() {
    var preloader_cont = document.getElementById("preloader_cont");
    preloader_cont.style.visibility = "visible";    
    m_data.load(APP_ASSETS_PATH + "my_stickman2.json", load_cb, preloader_cb);
}

/**
 * update the app's preloader
 */
function preloader_cb(percentage) {
    m_preloader.update_preloader(percentage);
}

/**
 * callback executed when the scene data is loaded
 */
function load_cb(data_id, success) {

    if (!success) {
        console.log("b4w load failure");
        return;
    }

    // m_app.enable_camera_controls();

    // place your code here
    _character = m_scs.get_first_character();
    _character_rig = m_scs.get_object_by_name("Armature");

    setup_movement();
    setup_rotation();
    setup_jumping();

    m_anim.apply(_character_rig, "idle");
    m_anim.play(_character_rig);
    m_anim.set_behavior(_character_rig, m_anim.AB_CYCLIC);

}
    
function preloader_cb(percentage) {
    var prelod_dynamic_path = document.getElementById("prelod_dynamic_path");
    var percantage_num      = prelod_dynamic_path.nextElementSibling;

    prelod_dynamic_path.style.width = percentage + "%";
    percantage_num.innerHTML = percentage + "%";	   
    if (percentage == 100) {
        var preloader_cont = document.getElementById("preloader_cont");
	preloader_cont.style.visibility = "hidden";
        return;
    }
}

function setup_movement() {
    var key_w     = m_ctl.create_keyboard_sensor(m_ctl.KEY_W);
    var key_s     = m_ctl.create_keyboard_sensor(m_ctl.KEY_S);
    var key_up    = m_ctl.create_keyboard_sensor(m_ctl.KEY_UP);
    var key_down  = m_ctl.create_keyboard_sensor(m_ctl.KEY_DOWN);

    var move_array = [
        key_w, key_up,
        key_s, key_down
    ];

    var forward_logic  = function(s){return (s[0] || s[1])};
    var backward_logic = function(s){return (s[2] || s[3])};

    function move_cb(obj, id, pulse) {
        if (pulse == 1) {
            switch(id) {
            case "FORWARD":
                var move_dir = 1;
                m_anim.apply(_character_rig, "walk");
                break;
            case "BACKWARD":
                var move_dir = -1;
                m_anim.apply(_character_rig, "walk");
                break;
            }
        } else {
            var move_dir = 0;
            m_anim.apply(_character_rig, "idle");
        }

        m_phy.set_character_move_dir(obj, move_dir, 0);

        m_anim.play(_character_rig);
        m_anim.set_behavior(_character_rig, m_anim.AB_CYCLIC);
    };

    m_ctl.create_sensor_manifold(_character, "FORWARD", m_ctl.CT_TRIGGER,
        move_array, forward_logic, move_cb);
    m_ctl.create_sensor_manifold(_character, "BACKWARD", m_ctl.CT_TRIGGER,
        move_array, backward_logic, move_cb);
}
    
function setup_rotation() {
    var key_a     = m_ctl.create_keyboard_sensor(m_ctl.KEY_A);
    var key_d     = m_ctl.create_keyboard_sensor(m_ctl.KEY_D);
    var key_left  = m_ctl.create_keyboard_sensor(m_ctl.KEY_LEFT);
    var key_right = m_ctl.create_keyboard_sensor(m_ctl.KEY_RIGHT);

    var elapsed_sensor = m_ctl.create_elapsed_sensor();

    var rotate_array = [
        key_a, key_left,
        key_d, key_right,
        elapsed_sensor
    ];

    var left_logic  = function(s){return (s[0] || s[1])};
    var right_logic = function(s){return (s[2] || s[3])};

    function rotate_cb(obj, id, pulse) {

        var elapsed = m_ctl.get_sensor_value(obj, "LEFT", 4);

        if (pulse == 1) {
            switch(id) {
            case "LEFT":
                m_phy.character_rotation_inc(obj, elapsed * ROT_SPEED, 0);
                break;
            case "RIGHT":
                m_phy.character_rotation_inc(obj, -elapsed * ROT_SPEED, 0);
                break;
            }
        }
    }

    m_ctl.create_sensor_manifold(_character, "LEFT", m_ctl.CT_CONTINUOUS,
        rotate_array, left_logic, rotate_cb);
    m_ctl.create_sensor_manifold(_character, "RIGHT", m_ctl.CT_CONTINUOUS,
        rotate_array, right_logic, rotate_cb);
}
    
function setup_jumping() {
    var key_space = m_ctl.create_keyboard_sensor(m_ctl.KEY_SPACE);

    var jump_cb = function(obj, id, pulse) {
        if (pulse == 1) {
            m_phy.character_jump(obj);
        }
    }

    m_ctl.create_sensor_manifold(_character, "JUMP", m_ctl.CT_TRIGGER, 
        [key_space], function(s){return s[0]}, jump_cb);
}  
});

// import the app module and start the app by calling the init method
b4w.require("my_stickman2_main").init();