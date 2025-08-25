<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #main div and all content after
 *
 * @package Neux
 */
?>

		</div><!-- #main -->

		<div id="post-footer" class=" post-footer linkstyle">
			<div class="hgrid">
				<div class="hgrid-span-12">
					<p class="credit small">
						<?php
						/* translators: 1: Theme name, 2: Theme author. */
						printf( esc_html__( 'Designed using %1$s. Powered by %2$s.', 'neux-child' ), '<a class="theme-link" href="https://wphoot.com/themes/neux/" title="Neux WordPress Theme">Neux</a>', '<a class="wp-link" href="https://wordpress.org">WordPress</a>' );
						?>
					</p><!-- .credit -->
				</div>
			</div>
		</div>

	</div><!-- #page-wrapper -->

    <!-- ========================================================================= -->
    <!-- GLOBÁLNÍ SPODNÍ NAVIGAČNÍ LIŠTA                                           -->
    <!-- ========================================================================= -->
    <footer class="app-bottom-nav">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="nav-item" aria-label="Home">
            <i class="fas fa-home"></i>
            <span>Domů</span>
        </a>
        <a href="<?php echo esc_url( home_url( '/biblicky-text/' ) ); ?>" class="nav-item" aria-label="Text">
            <i class="fas fa-book-open"></i>
            <span>Text</span>
        </a>
        <a href="<?php echo esc_url( home_url( '/duchovni-obnova/' ) ); ?>" class="nav-item" aria-label="Obnova">
            <i class="fas fa-sync-alt"></i>
            <span>Obnova</span>
        </a>
        <a href="<?php echo esc_url( home_url( '/audio/' ) ); ?>" class="nav-item" aria-label="Audio">
            <i class="fas fa-headphones"></i>
            <span>Audio</span>
        </a>
        <a href="<?php echo esc_url( home_url( '/informace/' ) ); ?>" class="nav-item" aria-label="Info">
            <i class="fas fa-pen"></i>
            <span>Info</span>
        </a>
    </footer>

<?php wp_footer(); ?>

</body>
</html>
