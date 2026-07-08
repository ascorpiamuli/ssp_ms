@extends('pdf.layouts.master')

@section('title', 'TUMCATHCOM Members Directory')

@section('header_title', 'TUMCATHCOM MEMBERS DIRECTORY')

@section('footer_left', 'TUM Catholic Community - Official Members Directory')
@section('footer_right', 'Confidential Document')

@section('content')
<!-- Statistics Cards -->
<div class="stats">
  <div class="stat-box">
    <div class="stat-value">{{ $stats['total'] ?? 0 }}</div>
    <div class="stat-label">TOTAL MEMBERS</div>
  </div>
  <div class="stat-box">
    <div class="stat-value">{{ $stats['active'] ?? 0 }}</div>
    <div class="stat-label">ACTIVE</div>
  </div>
  <div class="stat-box">
    <div class="stat-value">{{ $stats['inactive'] ?? 0 }}</div>
    <div class="stat-label">INACTIVE</div>
  </div>
  <div class="stat-box">
    <div class="stat-value">{{ $stats['suspended'] ?? 0 }}</div>
    <div class="stat-label">SUSPENDED</div>
  </div>
</div>

<!-- Members Table -->
<div class="table-container">
  <table class="data-table">
    <thead>
      <tr>
        <th width="10%">MEMBER ID</th>
        <th width="18%">FULL NAME</th>
        <th width="22%">EMAIL ADDRESS</th>
        <th width="12%">PHONE</th>
        <th width="12%">ROLE</th>
        <th width="10%">STATUS</th>
        <th width="16%">JOINED DATE</th>
      </tr>
    </thead>
    <tbody>
      @forelse($members ?? [] as $member)
      <tr>
        <td class="member-id"><strong>{{ $member['member_id'] }}</strong></td>
        <td class="member-name">{{ $member['full_name'] }}</td>
        <td>{{ $member['email'] }}</td>
        <td>{{ $member['phone'] ?? 'N/A' }}</td>
        <td><span class="role-badge">{{ ucfirst($member['role'] ?? 'Member') }}</span></td>
        <td><span class="status-{{ $member['status'] ?? 'active' }}">{{ ucfirst($member['status'] ?? 'Active') }}</span></td>
        <td>{{ isset($member['created_at']) ? \Carbon\Carbon::parse($member['created_at'])->format('d M Y') : 'N/A' }}</td>
      </tr>
      @empty
      <tr>
        <td colspan="7" class="text-center" style="padding: 40px;">No members found matching the criteria</td>
      </tr>
      @endforelse
    </tbody>
  </table>
</div>
@endsection
