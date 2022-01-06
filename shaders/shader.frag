precision highp float;

varying vec3 fNormal;
uniform vec3 uColor;

void main() {
    gl_FragColor = vec4(abs(dot(normalize(vec3(1,1,1)), normalize(fNormal)))*uColor + vec3(0.05, 0.05, 0.05), 1.0);
}