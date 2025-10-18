export const handleBake = ({ mesh, texture, intensity = 1.0 }) => {
    mesh.material.onBeforeCompile = (shader) => {
        if (texture) {
            shader.uniforms.bakeMap = { value: texture };
            shader.uniforms.uBakeIntensity = { value: intensity };
            /* vextrerBefore */
            const mainVexter = /* glsl */ `
            attribute vec2 uv1;
            varying vec2 vBakeUv2;
            void main() {
                vBakeUv2 = uv1;
            `;
            shader.vertexShader = shader.vertexShader.replace('void main() {', mainVexter);

            // 替换片元
            const mainFragment = /* glsl */ `
            varying vec2 vBakeUv2;
            uniform sampler2D bakeMap;
            uniform float uBakeIntensity;
            void main() {`;
            shader.fragmentShader = shader.fragmentShader.replace('void main() {', mainFragment);

            // 替换片元
            const outputFragment = /* glsl */ `
            #include <opaque_fragment>
            vec3 bakeCol = texture2D(bakeMap, vBakeUv2).rgb ;
            bakeCol.x = pow(bakeCol.x, uBakeIntensity);
            bakeCol.y = pow(bakeCol.y, uBakeIntensity);
            bakeCol.z = pow(bakeCol.z, uBakeIntensity);
            outgoingLight *= bakeCol;
            gl_FragColor = vec4( outgoingLight, diffuseColor.a );`;
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <opaque_fragment>',
                outputFragment
            );
        }
    };
};
