"use strict"

// register the application module
b4w.register("firstpersongd_main", function(exports, require) {

// import modules used by the app
var m_app       = require("app");
var m_cfg       = require("config");
var m_data      = require("data");
var m_preloader = require("preloader");
var m_ver       = require("version");
var m_anim    = require("animation");
var m_cnst    = require("constraints");
var m_ctl     = require("controls");
var m_phy     = require("physics");
var m_cont    = require("container");
var m_gp_cf   = require("gp_conf");
var m_input   = require("input");
var m_obj     = require("objects");
var m_scenes  = require("scenes");
var m_trans   = require("transform");
var m_vec3    = require("vec3");
var m_quat    = require("quat");
var m_util    = require("util");
var m_main    = require("main");
var m_log_nodes = require("logic_nodes");
var m_scs = require("scenes");
var m_sfx = require("sfx");
var m_fps = require("fps");
var m_mouse = require("mouse");
var m_hud = require("hud");

// detect application mode
var DEBUG = (m_ver.type() == "DEBUG");
var FPS_GAME_CAM_SMOOTH_FACTOR = 0.01;
var FPS_GAME_SENSITIVITY = 110;
    var show_fps = DEBUG;

    var url_params = m_app.get_url_params();

    if (url_params && "show_fps" in url_params)
        show_fps = true;

// automatically detect assets path
var APP_ASSETS_PATH = m_cfg.get_assets_path("firstpersongd");

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    var show_fps = DEBUG;

    var url_params = m_app.get_url_params();

    if (url_params && "show_fps" in url_params)
        show_fps = true;
    
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        show_fps: show_fps,
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
    m_data.load(APP_ASSETS_PATH + "firstpersongd.json", load_cb, preloader_cb);
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

    //m_app.enable_camera_controls();

    // make camera follow the character
    
    m_fps.enable_fps_controls();
    m_fps.set_cam_smooth_factor(FPS_GAME_CAM_SMOOTH_FACTOR);
    m_fps.set_cam_sensitivity(FPS_GAME_SENSITIVITY);
    
    m_mouse.enable_mouse_hover_outline();
    
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
    
});

// import the app module and start the app by calling the init method
b4w.require("firstpersongd_main").init();
