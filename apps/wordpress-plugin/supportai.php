<?php
/**
 * Plugin Name: SupportAI Chat Widget
 * Plugin URI: https://supportai.com
 * Description: AI-powered customer support chat widget for your WordPress site
 * Version: 1.0.0
 * Author: SupportAI
 * Author URI: https://supportai.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: supportai
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SUPPORTAI_VERSION', '1.0.0');
define('SUPPORTAI_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SUPPORTAI_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main SupportAI Plugin Class
 */
class SupportAI_Plugin {
    
    private static $instance = null;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        // Initialize hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_footer', array($this, 'render_widget'));
        add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('SupportAI', 'supportai'),
            __('SupportAI', 'supportai'),
            'manage_options',
            'supportai',
            array($this, 'render_settings_page'),
            'dashicons-format-chat',
            30
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('supportai_settings', 'supportai_workspace_id', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => '',
        ));
        
        register_setting('supportai_settings', 'supportai_enabled', array(
            'type' => 'boolean',
            'default' => false,
        ));
        
        register_setting('supportai_settings', 'supportai_primary_color', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_hex_color',
            'default' => '#3b82f6',
        ));
        
        register_setting('supportai_settings', 'supportai_position', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'bottom-right',
        ));
        
        register_setting('supportai_settings', 'supportai_greeting', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'Hi there! 👋 How can we help you today?',
        ));
        
        register_setting('supportai_settings', 'supportai_company_name', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => get_bloginfo('name'),
        ));
    }
    
    /**
     * Admin scripts
     */
    public function admin_scripts($hook) {
        if ($hook !== 'toplevel_page_supportai') {
            return;
        }
        
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Save settings message
        if (isset($_GET['settings-updated'])) {
            add_settings_error('supportai_messages', 'supportai_message', __('Settings saved.', 'supportai'), 'updated');
        }
        
        settings_errors('supportai_messages');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div style="display: flex; gap: 24px; margin-top: 20px;">
                <div style="flex: 2;">
                    <form method="post" action="options.php">
                        <?php settings_fields('supportai_settings'); ?>
                        
                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row">
                                    <label for="supportai_enabled"><?php esc_html_e('Enable Widget', 'supportai'); ?></label>
                                </th>
                                <td>
                                    <label>
                                        <input type="checkbox" name="supportai_enabled" id="supportai_enabled" value="1" <?php checked(get_option('supportai_enabled'), true); ?>>
                                        <?php esc_html_e('Show chat widget on this site', 'supportai'); ?>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="supportai_workspace_id"><?php esc_html_e('Workspace ID', 'supportai'); ?></label>
                                </th>
                                <td>
                                    <input type="text" name="supportai_workspace_id" id="supportai_workspace_id" value="<?php echo esc_attr(get_option('supportai_workspace_id')); ?>" class="regular-text">
                                    <p class="description"><?php esc_html_e('Your SupportAI workspace ID. Find this in your dashboard settings.', 'supportai'); ?></p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="supportai_company_name"><?php esc_html_e('Company Name', 'supportai'); ?></label>
                                </th>
                                <td>
                                    <input type="text" name="supportai_company_name" id="supportai_company_name" value="<?php echo esc_attr(get_option('supportai_company_name', get_bloginfo('name'))); ?>" class="regular-text">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="supportai_primary_color"><?php esc_html_e('Primary Color', 'supportai'); ?></label>
                                </th>
                                <td>
                                    <input type="text" name="supportai_primary_color" id="supportai_primary_color" value="<?php echo esc_attr(get_option('supportai_primary_color', '#3b82f6')); ?>" class="color-picker-field" data-default-color="#3b82f6">
                                    <script>
                                        jQuery(document).ready(function($) {
                                            $('.color-picker-field').wpColorPicker();
                                        });
                                    </script>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="supportai_position"><?php esc_html_e('Widget Position', 'supportai'); ?></label>
                                </th>
                                <td>
                                    <select name="supportai_position" id="supportai_position">
                                        <option value="bottom-right" <?php selected(get_option('supportai_position'), 'bottom-right'); ?>><?php esc_html_e('Bottom Right', 'supportai'); ?></option>
                                        <option value="bottom-left" <?php selected(get_option('supportai_position'), 'bottom-left'); ?>><?php esc_html_e('Bottom Left', 'supportai'); ?></option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="supportai_greeting"><?php esc_html_e('Greeting Message', 'supportai'); ?></label>
                                </th>
                                <td>
                                    <input type="text" name="supportai_greeting" id="supportai_greeting" value="<?php echo esc_attr(get_option('supportai_greeting', 'Hi there! 👋 How can we help you today?')); ?>" class="large-text">
                                </td>
                            </tr>
                        </table>
                        
                        <?php submit_button(); ?>
                    </form>
                </div>
                
                <div style="flex: 1; background: #f0f0f1; padding: 20px; border-radius: 8px;">
                    <h2 style="margin-top: 0;">🚀 Getting Started</h2>
                    <ol>
                        <li>Sign up at <a href="https://app.supportai.com" target="_blank">app.supportai.com</a></li>
                        <li>Create a workspace for your business</li>
                        <li>Copy your Workspace ID from Settings</li>
                        <li>Paste it above and enable the widget</li>
                    </ol>
                    
                    <h3>Need Help?</h3>
                    <p>
                        <a href="https://docs.supportai.com" target="_blank">📚 Documentation</a><br>
                        <a href="mailto:support@supportai.com">✉️ Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render widget in footer
     */
    public function render_widget() {
        // Check if enabled
        if (!get_option('supportai_enabled')) {
            return;
        }
        
        // Check workspace ID
        $workspace_id = get_option('supportai_workspace_id');
        if (empty($workspace_id)) {
            return;
        }
        
        // Get settings
        $settings = array(
            'workspaceId' => $workspace_id,
            'primaryColor' => get_option('supportai_primary_color', '#3b82f6'),
            'position' => get_option('supportai_position', 'bottom-right'),
            'greeting' => get_option('supportai_greeting', 'Hi there! 👋 How can we help you today?'),
            'companyName' => get_option('supportai_company_name', get_bloginfo('name')),
        );
        
        // Output widget script
        ?>
        <script>
            (function() {
                var s = document.createElement('script');
                s.src = 'https://cdn.supportai.com/widget.js';
                s.async = true;
                s.onload = function() {
                    if (window.SupportWidget) {
                        window.SupportWidget.init(<?php echo json_encode($settings); ?>);
                    }
                };
                document.body.appendChild(s);
            })();
        </script>
        <?php
    }
}

// Initialize plugin
SupportAI_Plugin::get_instance();

/**
 * Shortcode to embed widget
 * Usage: [supportai_widget]
 */
function supportai_widget_shortcode($atts) {
    // This is a placeholder - the widget is automatically injected in footer
    return '<!-- SupportAI Widget -->';
}
add_shortcode('supportai_widget', 'supportai_widget_shortcode');
