<?php

namespace App\Libraries;

use TCPDF;

class CustomTCPDF extends TCPDF
{
    // Header template
    protected $customHeader = null;
    protected $customHeaderData = [];

    // Footer template
    protected $customFooter = null;
    protected $customFooterData = [];

    // Callback functions
    protected $headerCallback = null;
    protected $footerCallback = null;

    // Custom header/footer with logo support
    public $customHeaderLogo = null;
    public $customHeaderTitle = '';
    public $customHeaderSubtitle = '';

    public function setPaperFormat($size, $orientation)
    {
        $this->setPageFormat($size, $orientation);
        return $this;
    }

    public function setCustomHeader($headerHtml)
    {
        $this->customHeader = $headerHtml;
    }

    public function setCustomFooter($footerHtml)
    {
        $this->customFooter = $footerHtml;
    }

    /**
     * Set custom header callback function
     */
    public function setCustomHeaderCallback(callable $callback)
    {
        $this->headerCallback = $callback;
    }

    /**
     * Set custom footer callback function
     */
    public function setCustomFooterCallback(callable $callback)
    {
        $this->footerCallback = $callback;
    }

    /**
     * Set custom header with logo (direct drawing method)
     */
    public function setCustomHeaderWithLogo($logoPath, $title, $subtitle)
    {
        $this->customHeaderLogo = $logoPath;
        $this->customHeaderTitle = $title;
        $this->customHeaderSubtitle = $subtitle;
    }

    /**
     * Override Header method
     */
    public function Header()
    {
        // Use callback if set
        if ($this->headerCallback !== null) {
            call_user_func($this->headerCallback, $this);
            return;
        }

        // Use direct drawing method if logo/title set
        if ($this->customHeaderLogo || $this->customHeaderTitle) {
            $this->drawCustomHeader();
            return;
        }

        // Use HTML method if set
        if ($this->customHeader) {
            $this->writeHTML($this->customHeader, true, false, true, false, '');
        }
    }

    /**
     * Draw custom header using direct TCPDF methods
     */
    protected function drawCustomHeader()
    {
        $startY = 10;

        // Draw logo if exists
        if ($this->customHeaderLogo && file_exists($this->customHeaderLogo)) {
            $this->Image($this->customHeaderLogo, 15, $startY, 30, 0, '', '', '', false, 300);
            $textX = 55;
        } else {
            $textX = 15;
        }

        // Draw title
        $this->SetFont('helvetica', 'B', 14);
        $this->SetTextColor(107, 33, 165);
        $this->SetXY($textX, $startY + 5);
        $this->Cell(0, 8, $this->customHeaderTitle, 0, 1, 'L');

        // Draw subtitle
        if ($this->customHeaderSubtitle) {
            $this->SetFont('helvetica', 'I', 9);
            $this->SetTextColor(107, 114, 128);
            $this->SetXY($textX, $startY + 14);
            $this->Cell(0, 6, $this->customHeaderSubtitle, 0, 1, 'L');
        }

        // Draw date
        $this->SetFont('helvetica', '', 8);
        $this->SetTextColor(107, 114, 128);
        $this->SetXY($this->getPageWidth() - 50, $startY + 5);
        $this->Cell(45, 6, date('d M Y'), 0, 0, 'R');

        // Draw separator line
        $this->SetDrawColor(107, 33, 165);
        $this->SetLineWidth(0.5);
        $this->Line(15, $startY + 28, $this->getPageWidth() - 15, $startY + 28);

        // Set Y position after header
        $this->SetY($startY + 35);
    }

    /**
     * Override Footer method
     */
    public function Footer()
    {
        // Use callback if set
        if ($this->footerCallback !== null) {
            call_user_func($this->footerCallback, $this);
            return;
        }

        // Use HTML method if set
        if ($this->customFooter) {
            $this->writeHTML($this->customFooter, true, false, true, false, '');
        } else {
            // Default footer with page number
            $this->SetY(-15);
            $this->SetFont('helvetica', 'I', 8);
            $this->SetTextColor(128, 128, 128);
            $this->Cell(0, 10, 'Page ' . $this->getAliasNumPage() . ' of ' . $this->getAliasNbPages(), 0, 0, 'C');
        }
    }
}
