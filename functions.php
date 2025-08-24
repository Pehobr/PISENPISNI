<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

/**
 * Hlavní funkce pro načítání stylů a skriptů.
 * Rozděleno pro lepší přehlednost.
 */
add_action( 'wp_enqueue_scripts', 'neux_child_enqueue_assets', 20 );
function neux_child_enqueue_assets() {
    
    // --- ZÁKLADNÍ STYLY A SKRIPTY (načítají se vždy) ---
    $parent_style = 'neux-parent-style'; 
    wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css' );

    // Hlavní styl child šablony (obsahuje už jen globální styly)
    wp_enqueue_style( 'neux-child-style', get_stylesheet_uri(), array( $parent_style ), '3.0.0' );
    
    // Hlavní JS soubor (obsahuje už jen globální skripty)
    wp_enqueue_script('neux-child-main-js', get_stylesheet_directory_uri() . '/js/main.js', array('jquery'), '3.0.0', true);

    
    // --- PODMÍNĚNÉ NAČÍTÁNÍ PRO ŠABLONU "DUCHOVNÍ OBNOVA" ---
    if ( is_page_template('template-obnova.php') ) {
        // Načtení stylů pro obnovu
        wp_enqueue_style( 'neux-child-obnova-style', get_stylesheet_directory_uri() . '/css/obnova.css', array('neux-child-style'), '1.0.0' );

        // Načtení JS pro obnovu (nyní rozdělené)
        // Důležité je správné pořadí závislostí
        wp_enqueue_script('neux-child-obnova-menu-js', get_stylesheet_directory_uri() . '/js/obnova-menu.js', array('jquery'), '1.0.0', true);
        wp_enqueue_script('neux-child-obnova-audio-js', get_stylesheet_directory_uri() . '/js/obnova-audio.js', array('jquery'), '1.0.0', true);
        wp_enqueue_script('neux-child-obnova-prezentace-js', get_stylesheet_directory_uri() . '/js/obnova-prezentace.js', array('jquery'), '1.0.0', true);
        // Hlavní skript pro obnovu by měl být načten jako poslední, protože závisí na ostatních obnova- modulech
        wp_enqueue_script('neux-child-obnova-core-js', get_stylesheet_directory_uri() . '/js/obnova-core.js', array('jquery', 'neux-child-obnova-menu-js', 'neux-child-obnova-audio-js', 'neux-child-obnova-prezentace-js'), '1.0.0', true);
    }
    
    // --- PODMÍNĚNÉ NAČÍTÁNÍ PRO ŠABLONU "KALKULAČKA" NEBO PRO HLAVNÍ STRÁNKU ---
    if ( is_page_template('template-kalkulacka.php') || is_page(1778) ) {
        // Načtení stylů pro kalkulačku
        wp_enqueue_style( 'neux-child-kalkulacka-style', get_stylesheet_directory_uri() . '/css/kalkulacka.css', array('neux-child-style'), '1.0.0' );
        
        // Skript pro kalkulačku
        wp_enqueue_script('neux-child-kalkulacka-js', get_stylesheet_directory_uri() . '/js/kalkulacka.js', array('jquery'), '1.0.1', true);
    }

    // --- PODMÍNĚNÉ NAČÍTÁNÍ PRO ŠABLONU "POZNÁMKY" ---
    if ( is_page_template('template-poznamky.php') ) {
        // Načtení stylů pro poznámky
        wp_enqueue_style( 'neux-child-poznamky-style', get_stylesheet_directory_uri() . '/css/poznamky.css', array('neux-child-style'), '1.0.0' );
        
        // Skript pro poznámky (bez závislostí kromě jQuery, pokud se používá)
        // Původní kód obnova.js deklaroval externí globální proměnné pro TTS
        // Tyto proměnné byly nyní odstraněny, takže obnova.js už na main.js nezávisí
        // Poznámky.js na main.js nikdy přímo nezávisely
        wp_enqueue_script('neux-child-poznamky-js', get_stylesheet_directory_uri() . '/js/poznamky.js', array(), '1.0.0', true);
    }
}


/**
 * Vkládání dat do patičky stránky pomocí wp_footer.
 * Každá funkce je nyní oddělená pro přehlednost.
 */
add_action('wp_footer', 'moje_vkladani_dat_do_paticky');
function moje_vkladani_dat_do_paticky() {
    
    // Vložení dat POUZE pro šablonu duchovní obnovy
    if ( is_page_template('template-obnova.php') ) {
        
        $args_obnova = array(
            'post_type' => 'post', 'posts_per_page' => -1, 'category_name' => 'mobilni-aplikace',
            'orderby' => 'date', 'order' => 'ASC',
        );
        $obnova_posts_query = new WP_Query($args_obnova);
        $obnova_data = array();
        if ($obnova_posts_query->have_posts()) {
            $day_counter = 1;
            while ($obnova_posts_query->have_posts()) {
                $obnova_posts_query->the_post();
                
                $audio_url = get_post_meta( get_the_ID(), 'audio_url', true );
                $ai_audio_url = get_post_meta( get_the_ID(), 'ai_audio_url', true ); 
                $prezentace_src = get_post_meta( get_the_ID(), 'prezentace_embed_src', true );
                
                $obnova_data[] = array(
                    'day' => $day_counter, 
                    'title' => get_the_title(),
                    'content' => apply_filters('the_content', get_the_content()), 
                    'audio_url' => $audio_url,
                    'ai_audio_url' => $ai_audio_url,
                    'prezentace_embed_src' => $prezentace_src
                );
                $day_counter++;
            }
        }
        wp_reset_postdata();

        $args_nedele = array(
            'post_type' => 'post', 'posts_per_page' => 1, 'category_name' => 'nedele',
            'orderby' => 'date', 'order' => 'DESC',
        );
        $nedele_query = new WP_Query($args_nedele);
        $nedele_data = null;
        if ($nedele_query->have_posts()) {
            while ($nedele_query->have_posts()) {
                $nedele_query->the_post();
                $nedele_data = array('title' => get_the_title(), 'content' => apply_filters('the_content', get_the_content()));
            }
        } else {
            $nedele_data = array('title' => 'Neděle - den odpočinku', 'content' => '<p>Dnes je den odpočinku...</p>');
        }
        wp_reset_postdata();
        
        $final_data = array('posts' => $obnova_data, 'sundayPost' => $nedele_data);
        echo "<script id='obnova-app-data'> var obnovaApp = " . wp_json_encode($final_data) . "; </script>";
    }

    // Vložení dat pro šablonu kalkulačky NEBO pro hlavní stránku
    if ( is_page_template('template-kalkulacka.php') || is_page(1778) ) {
        $args_obnova = array(
            'post_type' => 'post', 'posts_per_page' => -1, 'category_name' => 'mobilni-aplikace', 'fields' => 'ids',
        );
        $obnova_posts_query = new WP_Query($args_obnova);
        $post_count = $obnova_posts_query->found_posts;
        echo "<script id='kalkulacka-data'> var kalkulackaData = { postCount: " . intval($post_count) . " }; </script>";
    }
}

/**
 * Skrytí prvků šablony pomocí inline CSS na specifických stránkách.
 * Lepší než !important v hlavním CSS souboru.
 */
add_action('wp_head', 'moje_inline_css_overrides', 999);
function moje_inline_css_overrides() {
    if ( is_page_template('template-obnova.php') || is_page_template('template-poznamky.php') || is_page_template('template-kalkulacka.php') ) {
        $custom_css = "
            #header-primary, #post-footer, #loop-meta { display: none !important; }
            #main.main { margin-top: 7px !important; border-radius: 10px !important; }
        ";
        echo '<style type="text/css" id="moje-overrides">' . $custom_css . '</style>';
    }
}