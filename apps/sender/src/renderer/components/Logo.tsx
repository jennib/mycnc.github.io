import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> { }

const Logo: React.FC<LogoProps> = (props) => {
    // The path data for one flute/blade of the endmill icon
    const flutePath = "M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z";

    return (
        <svg
            viewBox="0 0 120 26.650463"
            version="1.1"
            id="svg1"
            xmlSpace="preserve"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            {...props}
        >
            <g
                id="layer1"
                transform="translate(-50.315762,-135.10602)"
            >
                <g
                    id="g1"
                    transform="matrix(0.26458333,0,0,0.26458333,40.790762,132.65232)"
                >
                    <g
                        transform="translate(86,60)"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        id="g2"
                    >
                        {/* Outer Circle */}
                        <circle
                            r="48"
                            id="circle1"
                            cx="0"
                            cy="0"
                        />

                        {/* Central hub */}
                        <circle
                            r="12"
                            id="circle2"
                            cx="0"
                            cy="0"
                        />

                        {/* 3 Flutes rotated 0, 120, 240 (-120) degrees */}
                        <path
                            d={flutePath}
                            id="flute1"
                        />
                        <path
                            d={flutePath}
                            transform="rotate(120)"
                            id="flute2"
                        />
                        <path
                            d={flutePath}
                            transform="rotate(240)"
                            id="flute3"
                        />
                    </g>

                    <text
                        x="146.11453"
                        y="77.89267"
                        fontFamily="Inter, 'Segoe UI', Roboto, Arial"
                        fontWeight="700"
                        fontSize="64px"
                        letterSpacing="-0.02em"
                        fill="currentColor"
                        id="text2"
                    >
                        <tspan
                            style={{ fill: '#6744e9', fillOpacity: 1 }}
                            id="tspan14"
                        >
                            mycnc
                        </tspan>
                        .app
                    </text>
                </g>
            </g>
        </svg>
    );
};

export default Logo;
